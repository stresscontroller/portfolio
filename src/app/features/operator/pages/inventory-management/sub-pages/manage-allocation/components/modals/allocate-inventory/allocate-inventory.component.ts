import { CommonModule, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    ReactiveFormsModule,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { UIState } from '../../../state';
import {
    Subject,
    distinctUntilChanged,
    from,
    map,
    of,
    switchMap,
    takeUntil,
    BehaviorSubject,
    filter,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { AvailableInventoryTableComponent } from '../../tables/available-inventory-table/available-inventory-table.component';
import { ManageAllocationState } from '../../../state';
import { AllocateInventoryState } from './allocate-inventory.state';
import { OperatorFiltersState, UIStatus } from '@app/core';
import { UnallocatedInventoryTableComponent } from '../../tables/unallocated-inventory-table/unallocated-inventory-table.component';
import { LoaderEmbedComponent } from '@app/shared';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
    standalone: true,
    selector: 'app-allocate-inventory-modal',
    templateUrl: './allocate-inventory.component.html',
    styleUrls: ['./allocate-inventory.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CheckboxModule,
        RadioButtonModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        DropdownModule,
        CalendarModule,
        AvailableInventoryTableComponent,
        UnallocatedInventoryTableComponent,
        LoaderEmbedComponent,
    ],
    providers: [AllocateInventoryState],
})
export class AllocateInventoryModalComponent {
    uiState = inject(UIState);
    manageAllocationState = inject(ManageAllocationState);
    allocateInventoryState = inject(AllocateInventoryState);
    operatorFiltersState = inject(OperatorFiltersState);

    options = [
        { label: 'One Time', value: 'OneTime' },
        { label: 'Daily', value: 'Daily' },
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Bi-Weekly', value: 'Biweekly' },
    ];
    dayOfWeekOptions = [
        { label: 'Sunday', value: '1' },
        { label: 'Monday', value: '2' },
        { label: 'Tuesday', value: '3' },
        { label: 'Wednesday', value: '4' },
        { label: 'Thursday', value: '5' },
        { label: 'Friday', value: '6' },
        { label: 'Saturday', value: '7' },
    ];

    allocateInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.allocateInventory),
        distinctUntilChanged()
    );
    allocateInventoryForm = new FormGroup({
        cruiseLine: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        cruiseShip: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        tour: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        port: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        fromDate: new FormControl<Date | null>(new Date()),
        toDate: new FormControl<Date | null>(new Date()),
        fromTime: new FormControl<Date | null>(null),
        toTime: new FormControl<Date | null>(null),
        selectedDays: new FormControl<string[]>([], { nonNullable: true }),
        frequency: new FormControl<'OneTime' | 'Daily' | 'Weekly' | 'Biweekly'>(
            'OneTime',
            {
                nonNullable: true,
                validators: Validators.required,
            }
        ),
        hideDuplicateInventories: new FormControl<boolean>(false),
        isShipScheduleTimeLimitOverride: new FormControl<boolean>(false),
    });
    inventory$ = this.allocateInventoryState.inventory$;

    filterLoading$ = this.operatorFiltersState.isLoading$;
    cruiseLines$ = this.operatorFiltersState.cruiseLines$;
    inventoryManagementInventoryType$ =
        this.operatorFiltersState.inventoryManagementInventoryType$;
    cruiseShips$ =
        this.allocateInventoryForm.controls.cruiseLine.valueChanges.pipe(
            switchMap((cruiseLine) => {
                if (cruiseLine == null) {
                    return of([]);
                }
                const cruiseShips =
                    this.operatorFiltersState.cruiseShips$.getValue();
                if (cruiseShips?.[cruiseLine]) {
                    return of(cruiseShips[cruiseLine]);
                } else {
                    return from(
                        this.operatorFiltersState.getShipList(cruiseLine)
                    );
                }
            })
        );
    isOpen$ = this.allocateInventoryModal$.pipe(map((modal) => modal.isOpen));
    appliedFilters$ = this.allocateInventoryModal$.pipe(
        map((data) => data.context)
    );
    searchStatus$ = new BehaviorSubject<UIStatus>('idle');
    submitStatus$ = new BehaviorSubject<UIStatus>('idle');
    tours$ = this.operatorFiltersState.tours$;
    ports$ = this.operatorFiltersState.ports$;

    // values for inventory table
    selectedInventoriesToAllocate: string[] = [];
    selectedFormValues: {
        cruiseLine: number | null;
        cruiseShip: number | null;
    } | null = null;
    allocateValidationError = false;

    private destroyed$ = new Subject<void>();

    defaultTime = new Date(new Date().setHours(8, 0, 0, 0));

    ngOnInit(): void {
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.uiState.closeAllocateInventoryModal();
        this.allocateInventoryForm.reset();
        this.allocateInventoryState.resetInventory();
    }

    search(): void {
        if (this.allocateInventoryForm.invalid) {
            Object.values(this.allocateInventoryForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }

        this.searchStatus$.next('loading');
        const formValues = this.allocateInventoryForm.getRawValue();

        this.allocateInventoryState
            .searchInventory({
                shipCompanyId: formValues.cruiseLine,
                shipId: formValues.cruiseShip || null,
                tourId: formValues.tour || 0,
                portId: formValues.port || 0,
                fromDate: formValues.fromDate
                    ? formatDate(
                          new Date(formValues.fromDate),
                          'YYYY-MM-dd',
                          'en-US'
                      )
                    : '',
                toDate: this.getToDate(),
                fromTime: formValues.fromTime
                    ? formatDate(
                          new Date(formValues.fromTime),
                          'HH:mm:ss',
                          'en-US'
                      )
                    : '00:00:00',
                toTime: this.getToTime(),
                days: this.getSelectedDays(),
                isBiWeekly: formValues.frequency === 'Biweekly' || false,
                hideDuplicateInventories:
                    formValues.hideDuplicateInventories || false,
                isShipScheduleTimeLimitOverride:
                    formValues.isShipScheduleTimeLimitOverride || false,
            })
            .then(() => {
                this.searchStatus$.next('idle');
                this.selectedFormValues = {
                    cruiseLine: formValues.cruiseLine,
                    cruiseShip: formValues.cruiseShip || null,
                };
            })
            .catch(() => {
                this.searchStatus$.next('error');
            });
    }

    onSelectInventory(data: string[]): void {
        this.selectedInventoriesToAllocate = data;
    }

    allocateInventory(): void {
        if (this.selectedInventoriesToAllocate.length === 0) {
            return;
        }
        this.submitStatus$.next('loading');
        if (
            !this.selectedFormValues ||
            this.selectedFormValues.cruiseLine === null
        ) {
            this.allocateValidationError = true;
            return;
        }
        this.allocateValidationError = false;
        this.allocateInventoryState
            .allocateInventory({
                // we need to send -1 for shipCompanyId and shipId for book directs instead of 0, but we're using shipCompanyId 0 for other filters
                // we should look into refactoring how this is handled in the future
                shipCompanyId:
                    this.selectedFormValues.cruiseLine === 0
                        ? -1
                        : this.selectedFormValues.cruiseLine,
                shipId:
                    this.selectedFormValues.cruiseLine === 0
                        ? -1
                        : this.selectedFormValues.cruiseShip || 0,
                ids: this.selectedInventoriesToAllocate.join(','),
            })
            .then(() => {
                this.submitStatus$.next('idle');
                this.manageAllocationState.reload();
                this.allocateInventoryForm.reset();
                this.close();
            })
            .catch(() => {
                this.submitStatus$.next('error');
            });
    }

    focusFromTime(): void {
        // workaround to automatically set the fromtime to the defaulted time value
        // as there is now ay to select the default time without:
        // - typing it out
        // - go to a different time and go back
        if (!this.allocateInventoryForm.controls.fromTime.getRawValue()) {
            this.allocateInventoryForm.controls.fromTime.setValue(
                this.defaultTime
            );
        }
    }

    focusToTime(): void {
        if (!this.allocateInventoryForm.controls.toTime.getRawValue()) {
            this.allocateInventoryForm.controls.toTime.setValue(
                this.defaultTime
            );
        }
    }

    private async setupForm() {
        await this.operatorFiltersState.getCruiseLines();
        await this.operatorFiltersState.getPorts();
        await this.operatorFiltersState.getTours();
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return this.appliedFilters$.pipe(
                        distinctUntilChanged((prev, curr) => {
                            return (
                                JSON.stringify(prev) === JSON.stringify(curr)
                            );
                        }),
                        takeUntil(this.destroyed$)
                    );
                })
            )
            .subscribe(async (appliedFilters) => {
                if (appliedFilters) {
                    // all shipCompanyIds for cruises are greater than 0
                    if (appliedFilters.shipCompanyId != null) {
                        await this.operatorFiltersState.getShipList(
                            appliedFilters.shipCompanyId
                        );
                        if (appliedFilters.shipCompanyId === 0) {
                            // book direct
                            this.allocateInventoryForm.controls.cruiseShip.clearValidators();
                            this.allocateInventoryForm.controls.cruiseShip.disable();
                        } else {
                            this.allocateInventoryForm.controls.cruiseShip.setValidators(
                                [Validators.required]
                            );
                            this.allocateInventoryForm.controls.cruiseShip.enable();
                        }
                    }

                    const parsedStartDateParams = new Date(
                        appliedFilters.fromDate
                    );

                    // Get the time zone offset in minutes
                    const timezoneStartOffset =
                        parsedStartDateParams.getTimezoneOffset();

                    // Adjust to local time zone
                    const startDate = new Date(
                        parsedStartDateParams.getTime() +
                            timezoneStartOffset * 60000
                    );

                    const parsedEndDateParams = new Date(appliedFilters.toDate);

                    // Get the time zone offset in minutes
                    const timezoneEndOffset =
                        parsedEndDateParams.getTimezoneOffset();

                    // Adjust to local time zone
                    const endDate = new Date(
                        parsedEndDateParams.getTime() +
                            timezoneEndOffset * 60000
                    );

                    this.allocateInventoryForm.patchValue({
                        cruiseLine: appliedFilters.shipCompanyId || null,
                        cruiseShip: appliedFilters.shipId || null,
                        tour: appliedFilters.tourId || null,
                        port: appliedFilters.portId || null,
                        fromDate: startDate || new Date(),
                        toDate: endDate || new Date(),
                    });
                }
            });

        // port is disabled and will be automatically updated based on selected tour
        this.allocateInventoryForm.controls.port.disable();
        this.allocateInventoryForm.controls.tour.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((tourId) => {
                const selectedTour = this.tours$
                    .getValue()
                    .find((tour) => tour.tourId === tourId);
                if (selectedTour?.portId) {
                    this.allocateInventoryForm.controls.port.setValue(
                        selectedTour.portId
                    );
                    this.allocateInventoryForm.controls.port.updateValueAndValidity();
                }
            });

        this.allocateInventoryForm.controls.cruiseLine.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((cruiseLine) => {
                this.allocateInventoryForm.controls.cruiseShip.reset();
                if (cruiseLine === 0 || cruiseLine === null) {
                    // not selected or book direct
                    this.allocateInventoryForm.controls.cruiseShip.clearValidators();
                    this.allocateInventoryForm.controls.cruiseShip.disable();

                    this.allocateInventoryForm.controls.isShipScheduleTimeLimitOverride.setValue(
                        false
                    );
                } else {
                    this.allocateInventoryForm.controls.cruiseShip.setValidators(
                        [Validators.required]
                    );
                    this.allocateInventoryForm.controls.cruiseShip.enable();
                }
                this.allocateInventoryForm.controls.cruiseShip.updateValueAndValidity();
            });

        this.allocateInventoryForm.controls.frequency.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((frequency) => {
                if (frequency === 'Daily' || frequency === 'OneTime') {
                    this.allocateInventoryForm.controls.selectedDays.reset();
                }
                this.allocateInventoryForm.controls.selectedDays.updateValueAndValidity();
            });
    }

    private getToDate(): string {
        const formValues = this.allocateInventoryForm.getRawValue();
        if (formValues.frequency === 'OneTime' && formValues.fromDate) {
            return formatDate(
                new Date(formValues.fromDate),
                'YYYY-MM-dd',
                'en-US'
            );
        } else if (formValues.toDate) {
            return formatDate(
                new Date(formValues.toDate),
                'YYYY-MM-dd',
                'en-US'
            );
        }
        return '';
    }

    private getToTime(): string {
        const formValues = this.allocateInventoryForm.getRawValue();
        if (formValues.frequency === 'OneTime' && formValues.fromTime) {
            return formatDate(
                new Date(formValues.fromTime),
                'HH:mm:ss',
                'en-US'
            );
        } else if (formValues.toTime) {
            return formatDate(new Date(formValues.toTime), 'HH:mm:ss', 'en-US');
        }
        return '23:59:59';
    }

    private getSelectedDays(): string {
        const formValues = this.allocateInventoryForm.getRawValue();
        if (formValues.frequency === 'OneTime') {
            return '';
        } else if (formValues.frequency === 'Daily') {
            return this.dayOfWeekOptions.map((day) => day.value).join(',');
        } else if (formValues.selectedDays) {
            return formValues.selectedDays.join(',');
        }
        return '';
    }
}
