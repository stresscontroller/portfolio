import { CommonModule, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ManageAllocationState, UIState } from '../../../state';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    from,
    map,
    of,
    switchMap,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AvailableInventoryTableComponent } from '../../tables/available-inventory-table/available-inventory-table.component';
import { ReleaseInventoryTableComponent } from '../../tables/release-inventory-table/release-inventory-table.component';
import { OperatorFiltersState, UIStatus } from '@app/core';
import { LoaderEmbedComponent } from '@app/shared';
import { ReleaseInventoryState } from './release-inventory.state';
import { InventoryManagementState } from '../../../../state';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
@Component({
    standalone: true,
    selector: 'app-release-inventory-modal',
    templateUrl: './release-inventory.component.html',
    styleUrls: ['./release-inventory.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        ButtonModule,
        CheckboxModule,
        RadioButtonModule,
        CalendarModule,
        AvailableInventoryTableComponent,
        ReleaseInventoryTableComponent,
        LoaderEmbedComponent,
    ],
    providers: [ReleaseInventoryState],
})
export class ReleaseInventoryModalComponent {
    uiState = inject(UIState);
    operatorFiltersState = inject(OperatorFiltersState);
    manageAllocationState = inject(ManageAllocationState);
    releaseInventoryState = inject(ReleaseInventoryState);
    inventoryManagementState = inject(InventoryManagementState);

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

    releaseInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.releaseInventory),
        distinctUntilChanged()
    );

    isOpen$ = this.releaseInventoryModal$.pipe(map((modal) => modal.isOpen));

    releaseInventoryForm = new FormGroup({
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
        port: new FormControl<number | null>(1, {
            validators: [Validators.required],
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
    });
    searchStatus$ = new BehaviorSubject<UIStatus>('idle');
    submitStatus$ = new BehaviorSubject<UIStatus>('idle');
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
    inventoryManagementInventoryType$ =
        this.operatorFiltersState.inventoryManagementInventoryType$;
    cruiseShips$ =
        this.releaseInventoryForm.controls.cruiseLine.valueChanges.pipe(
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
    tours$ = this.operatorFiltersState.tours$;
    ports$ = this.operatorFiltersState.ports$;
    inventory$ = this.releaseInventoryState.inventory$;
    appliedFilters$ = this.releaseInventoryModal$.pipe(
        map((data) => data.context)
    );

    selectedInventoriesToRelease: number[] = [];

    defaultTime = new Date(new Date().setHours(8, 0, 0, 0));

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setupForm();
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
        if (!this.releaseInventoryForm.controls.fromTime.getRawValue()) {
            this.releaseInventoryForm.controls.fromTime.setValue(
                this.defaultTime
            );
        }
    }

    focusToTime(): void {
        if (!this.releaseInventoryForm.controls.toTime.getRawValue()) {
            this.releaseInventoryForm.controls.toTime.setValue(
                this.defaultTime
            );
        }
    }

    close(): void {
        this.uiState.closeReleaseInventoryModal();
        this.releaseInventoryForm.reset();
        this.releaseInventoryState.resetInventory();
    }

    search(): void {
        if (this.releaseInventoryForm.invalid) {
            Object.values(this.releaseInventoryForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.releaseInventoryForm.getRawValue();
        this.searchStatus$.next('loading');
        this.releaseInventoryState
            .searchInventory({
                shipCompanyId: formValues.cruiseLine || 0,
                shipId:
                    formValues.cruiseLine === -1
                        ? -1
                        : formValues.cruiseShip || 0,
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
            })
            .then(() => {
                this.searchStatus$.next('idle');
            })
            .catch(() => {
                this.searchStatus$.next('error');
            });
    }

    onSelectInventory(data: number[]): void {
        this.selectedInventoriesToRelease = data;
    }

    saveReleasedInventory(): void {
        if (!this.selectedInventoriesToRelease) {
            return;
        }
        this.submitStatus$.next('loading');
        this.releaseInventoryState
            .saveReleaseInventory(this.selectedInventoriesToRelease)
            .then(() => {
                this.inventoryManagementState.refresh();
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
                    // all shipCompanyIds for cruises are greater than 0
                    if (appliedFilters.shipCompanyId != null) {
                        await this.operatorFiltersState.getShipList(
                            appliedFilters.shipCompanyId
                        );
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

                    this.releaseInventoryForm.patchValue({
                        cruiseLine: appliedFilters.shipCompanyId,
                        cruiseShip: appliedFilters.shipId || null,
                        tour: appliedFilters.tourId || null,
                        port: appliedFilters.portId || null,
                        fromDate: startDate || new Date(),
                        toDate: endDate || new Date(),
                        selectedDays: [],
                    });
                }
            });

        // port is disabled and will be automatically updated based on selected tour
        this.releaseInventoryForm.controls.port.disable();
        this.releaseInventoryForm.controls.tour.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((tourId) => {
                const selectedTour = this.tours$
                    .getValue()
                    .find((tour) => tour.tourId === tourId);
                if (selectedTour?.portId) {
                    this.releaseInventoryForm.controls.port.setValue(
                        selectedTour.portId
                    );
                    this.releaseInventoryForm.controls.port.updateValueAndValidity();
                }
            });

        this.releaseInventoryForm.controls.cruiseLine.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((cruiseLine) => {
                this.releaseInventoryForm.controls.cruiseShip.reset();
                if (
                    cruiseLine === -1 ||
                    cruiseLine === null ||
                    cruiseLine === 0
                ) {
                    this.releaseInventoryForm.controls.cruiseShip.disable();
                } else {
                    this.releaseInventoryForm.controls.cruiseShip.enable();
                }
                this.releaseInventoryForm.controls.cruiseShip.updateValueAndValidity();
            });

        this.releaseInventoryForm.controls.frequency.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((frequency) => {
                if (frequency === 'Daily' || frequency === 'OneTime') {
                    this.releaseInventoryForm.controls.selectedDays.reset();
                }
                this.releaseInventoryForm.controls.selectedDays.updateValueAndValidity();
            });
    }

    private getToDate(): string {
        const formValues = this.releaseInventoryForm.getRawValue();
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
        const formValues = this.releaseInventoryForm.getRawValue();
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
        const formValues = this.releaseInventoryForm.getRawValue();
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
