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
import { DeleteInventoryState } from './delete-inventory.state';
import { OperatorFiltersState } from '@app/core';
import { DeleteInventoryTableComponent } from '../../tables/delete-inventory-table/delete-inventory-table.component';
import { LoaderEmbedComponent } from '@app/shared';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
    standalone: true,
    selector: 'app-delete-inventory-modal',
    templateUrl: './delete-inventory.component.html',
    styleUrls: ['./delete-inventory.component.scss'],
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
        DeleteInventoryTableComponent,
        LoaderEmbedComponent,
    ],
    providers: [DeleteInventoryState],
})
export class DeleteInventoryModalComponent {
    uiState = inject(UIState);
    manageAllocationState = inject(ManageAllocationState);
    operatorFiltersState = inject(OperatorFiltersState);
    deleteInventoryState = inject(DeleteInventoryState);

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

    deleteInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteInventory),
        distinctUntilChanged()
    );
    deleteInventoryForm = new FormGroup({
        cruiseLine: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        cruiseShip: new FormControl<number | null>(null, {
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
        searchBy: new FormControl<'ALL' | 'A' | 'UA' | 'R'>('ALL'),
        selectedDays: new FormControl<string[]>([], { nonNullable: true }),
        frequency: new FormControl<'OneTime' | 'Daily' | 'Weekly' | 'Biweekly'>(
            'OneTime',
            {
                nonNullable: true,
                validators: Validators.required,
            }
        ),
    });
    inventory$ = this.deleteInventoryState.inventory$;
    inventoryManagementInventoryType$ =
        this.operatorFiltersState.inventoryManagementInventoryType$.pipe(
            map((inventoryTypes) =>
                inventoryTypes.filter(
                    (inventoryType) => inventoryType.id !== 'R'
                )
            )
        );
    manageAllocationInventories$ =
        this.manageAllocationState.manageAllocationInventories$;
    filterLoading$ = this.operatorFiltersState.isLoading$;
    cruiseLines$ = this.operatorFiltersState.cruiseLines$.pipe(
        map((cruiseLines) => {
            // these are handled differently from the rest of the app,
            // hence we're setting this locally. Book direct is -1 and
            // the 0 shipCompanyId will get omitted when making the API call
            return [
                {
                    shipCompanyId: 0,
                    shipCompanyName: 'All Cruise Lines',
                    shipCompanyColor: '#053654',
                    shipCompanyBackgroundColor: '#05365420',
                    dataSource: 'local',
                },
                {
                    shipCompanyId: -1,
                    shipCompanyName: 'Book Direct',
                    shipCompanyColor: '#053654',
                    shipCompanyBackgroundColor: '#05365420',
                    dataSource: 'local',
                },
                ...cruiseLines.filter(
                    (cruiseLine) => cruiseLine.shipCompanyId > 0
                ),
            ];
        })
    );
    cruiseShips$ =
        this.deleteInventoryForm.controls.cruiseLine.valueChanges.pipe(
            switchMap((cruiseLine) => {
                if (cruiseLine === null || cruiseLine === -1) {
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
    isOpen$ = this.deleteInventoryModal$.pipe(map((modal) => modal.isOpen));
    appliedFilters$ = this.deleteInventoryModal$.pipe(
        map((data) => data.context)
    );
    tours$ = this.operatorFiltersState.tours$;
    ports$ = this.operatorFiltersState.ports$;

    searchStatus$ = new BehaviorSubject<
        'idle' | 'loading' | 'success' | 'error'
    >('idle');
    submitStatus$ = new BehaviorSubject<
        'idle' | 'loading' | 'success' | 'error'
    >('idle');

    defaultTime = new Date(new Date().setHours(8, 0, 0, 0));

    selectedInventoriesToDelete: number[] = [];
    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.setupForm();
        this.deleteInventoryForm.controls.searchBy.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((searchBy) => {
                if (searchBy !== 'UA') {
                    this.deleteInventoryForm.controls.cruiseLine.setValidators([
                        Validators.required,
                    ]);
                    this.deleteInventoryForm.controls.cruiseLine.enable();
                    this.deleteInventoryForm.controls.cruiseShip.setValidators([
                        Validators.required,
                    ]);
                    this.deleteInventoryForm.controls.cruiseShip.enable();
                } else {
                    this.deleteInventoryForm.controls.cruiseLine.clearValidators();
                    this.deleteInventoryForm.controls.cruiseLine.disable();
                    this.deleteInventoryForm.controls.cruiseShip.clearValidators();
                    this.deleteInventoryForm.controls.cruiseShip.disable();
                    this.deleteInventoryForm.controls.cruiseLine.reset();
                    this.deleteInventoryForm.controls.cruiseShip.reset();
                }
                this.deleteInventoryForm.controls.cruiseShip.updateValueAndValidity();
                this.deleteInventoryForm.controls.cruiseLine.updateValueAndValidity();
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    focusFromTime(): void {
        // workaround to automatically set the fromtime to the defaulted time value
        // as there is now ay to select the default time without:
        // - typing it out
        // - go to a different time and go back
        if (!this.deleteInventoryForm.controls.fromTime.getRawValue()) {
            this.deleteInventoryForm.controls.fromTime.setValue(
                this.defaultTime
            );
        }
    }

    focusToTime(): void {
        if (!this.deleteInventoryForm.controls.toTime.getRawValue()) {
            this.deleteInventoryForm.controls.toTime.setValue(this.defaultTime);
        }
    }

    close(): void {
        this.uiState.closeDeleteInventoryModal();
        this.deleteInventoryForm.reset();
        this.deleteInventoryState.resetInventory();
    }
    search(): void {
        if (this.deleteInventoryForm.invalid) {
            Object.values(this.deleteInventoryForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.deleteInventoryForm.getRawValue();
        this.searchStatus$.next('loading');
        this.deleteInventoryState
            .searchInventory({
                shipCompanyId: formValues.cruiseLine,
                shipId:
                    formValues.cruiseLine === -1
                        ? -1
                        : formValues.cruiseShip || null,
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
                searchBy: formValues.searchBy || 'ALL',
                isBiWeekly: formValues.frequency === 'Biweekly' || false,
            })
            .then(() => {
                this.searchStatus$.next('idle');
            })
            .catch(() => {
                this.searchStatus$.next('error');
            });
    }

    onSelectInventory(data: number[]): void {
        this.selectedInventoriesToDelete = data;
    }

    deleteInventory(): void {
        if (this.selectedInventoriesToDelete.length === 0) {
            return;
        }
        this.submitStatus$.next('loading');
        this.deleteInventoryState
            .deleteMulitpleInventory({
                ids: this.selectedInventoriesToDelete.join(),
                searchBy: 'ALL',
            })
            .then(() => {
                this.submitStatus$.next('idle');
                this.manageAllocationState.reload();
                this.close();
            })
            .catch(() => {
                this.submitStatus$.next('error');
            });
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
                    if (appliedFilters.shipCompanyId) {
                        if (appliedFilters.shipCompanyId > 0) {
                            await this.operatorFiltersState.getShipList(
                                appliedFilters.shipCompanyId
                            );
                        }
                        if (appliedFilters.shipCompanyId === -1) {
                            // book direct
                            this.deleteInventoryForm.controls.cruiseShip.clearValidators();
                            this.deleteInventoryForm.controls.cruiseShip.disable();
                        } else {
                            this.deleteInventoryForm.controls.cruiseShip.setValidators(
                                [Validators.required]
                            );
                            this.deleteInventoryForm.controls.cruiseShip.enable();
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

                    this.deleteInventoryForm.patchValue({
                        cruiseLine: appliedFilters.shipCompanyId || null,
                        cruiseShip: appliedFilters.shipId || null,
                        tour: appliedFilters.tourId || null,
                        port: appliedFilters.portId || null,
                        fromDate: startDate || new Date(),
                        toDate: endDate || new Date(),
                        searchBy: appliedFilters.searchBy || 'ALL',
                    });
                }
            });

        // port is disabled and will be automatically updated based on selected tour
        this.deleteInventoryForm.controls.port.disable();
        this.deleteInventoryForm.controls.tour.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((tourId) => {
                const selectedTour = this.tours$
                    .getValue()
                    .find((tour) => tour.tourId === tourId);
                if (selectedTour?.portId) {
                    this.deleteInventoryForm.controls.port.setValue(
                        selectedTour.portId
                    );
                    this.deleteInventoryForm.controls.port.updateValueAndValidity();
                }
            });

        this.deleteInventoryForm.controls.cruiseLine.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((cruiseLine) => {
                this.deleteInventoryForm.controls.cruiseShip.reset();
                if (
                    cruiseLine === -1 ||
                    cruiseLine === null ||
                    cruiseLine === 0
                ) {
                    this.deleteInventoryForm.controls.cruiseShip.clearValidators();
                    this.deleteInventoryForm.controls.cruiseShip.disable();
                } else {
                    this.deleteInventoryForm.controls.cruiseShip.setValidators([
                        Validators.required,
                    ]);
                    this.deleteInventoryForm.controls.cruiseShip.enable();
                }
                this.deleteInventoryForm.controls.cruiseShip.updateValueAndValidity();
            });

        this.deleteInventoryForm.controls.frequency.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((frequency) => {
                if (frequency === 'Daily' || frequency === 'OneTime') {
                    this.deleteInventoryForm.controls.selectedDays.reset();
                }
                this.deleteInventoryForm.controls.selectedDays.updateValueAndValidity();
            });
    }

    private getToDate(): string {
        const formValues = this.deleteInventoryForm.getRawValue();
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
        const formValues = this.deleteInventoryForm.getRawValue();
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
        const formValues = this.deleteInventoryForm.getRawValue();
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
