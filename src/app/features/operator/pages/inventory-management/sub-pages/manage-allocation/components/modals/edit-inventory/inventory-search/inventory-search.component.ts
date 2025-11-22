import { CommonModule, formatDate } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
    ReactiveFormsModule,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
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
    startWith,
} from 'rxjs';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { OperatorFiltersState, UIStatus } from '@app/core';
import { LoaderEmbedComponent } from '@app/shared';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ManageAllocationState, UIState } from '../../../../state';
import { EditInventoryState } from '../edit-inventory.state';
import { EditInventoryTableComponent } from '../../../tables';

@Component({
    standalone: true,
    selector: 'app-inventory-search',
    templateUrl: './inventory-search.component.html',
    styleUrls: ['./inventory-search.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        DividerModule,
        DropdownModule,
        CalendarModule,
        CheckboxModule,
        RadioButtonModule,
        LoaderEmbedComponent,
        EditInventoryTableComponent,
    ],
})
export class InventorySearchComponent {
    @Output() next = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
    manageAllocationState = inject(ManageAllocationState);
    operatorFiltersState = inject(OperatorFiltersState);
    editInventoryState = inject(EditInventoryState);
    uiState = inject(UIState);

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

    editInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editInventory),
        distinctUntilChanged()
    );
    editInventoryForm = new FormGroup({
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
    inventories$ = this.editInventoryState.inventories$;
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
    cruiseShips$ = this.editInventoryForm.controls.cruiseLine.valueChanges.pipe(
        switchMap((cruiseLine) => {
            if (
                cruiseLine === undefined ||
                cruiseLine === null ||
                cruiseLine === 0 ||
                cruiseLine === -1
            ) {
                return of([]);
            }
            const cruiseShips =
                this.operatorFiltersState.cruiseShips$.getValue();
            if (cruiseShips?.[cruiseLine]) {
                return of(cruiseShips[cruiseLine]);
            } else {
                return from(this.operatorFiltersState.getShipList(cruiseLine));
            }
        })
    );
    isOpen$ = this.editInventoryModal$.pipe(map((modal) => modal.isOpen));
    appliedFilters$ = this.editInventoryModal$.pipe(
        map((data) => data.context),
        switchMap((filtersFromCaller) => {
            return this.editInventoryState.searchParams$.pipe(
                startWith(filtersFromCaller)
            );
        })
    );
    tours$ = this.operatorFiltersState.tours$;
    ports$ = this.operatorFiltersState.ports$;

    searchStatus$ = new BehaviorSubject<UIStatus>('idle');

    defaultTime = new Date(new Date().setHours(8, 0, 0, 0));

    selectedInventories$ = this.editInventoryState.selectedInventories$;

    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.setupForm();
        this.editInventoryForm.controls.searchBy.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((searchBy) => {
                if (searchBy !== 'UA') {
                    this.editInventoryForm.controls.cruiseLine.setValidators([
                        Validators.required,
                    ]);
                    this.editInventoryForm.controls.cruiseLine.enable();
                } else {
                    this.editInventoryForm.controls.cruiseLine.clearValidators();
                    this.editInventoryForm.controls.cruiseLine.disable();
                    this.editInventoryForm.controls.cruiseLine.reset();
                    this.editInventoryForm.controls.cruiseShip.reset();
                }
                this.editInventoryForm.controls.cruiseShip.updateValueAndValidity();
                this.editInventoryForm.controls.cruiseLine.updateValueAndValidity();
            });
    }

    ngOnDestroy(): void {
        this.editInventoryForm.reset();
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    focusFromTime(): void {
        // workaround to automatically set the fromtime to the defaulted time value
        // as there is now ay to select the default time without:
        // - typing it out
        // - go to a different time and go back
        if (!this.editInventoryForm.controls.fromTime.getRawValue()) {
            this.editInventoryForm.controls.fromTime.setValue(this.defaultTime);
        }
    }

    focusToTime(): void {
        if (!this.editInventoryForm.controls.toTime.getRawValue()) {
            this.editInventoryForm.controls.toTime.setValue(this.defaultTime);
        }
    }

    search(): void {
        if (this.editInventoryForm.invalid) {
            Object.values(this.editInventoryForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.editInventoryForm.getRawValue();
        this.searchStatus$.next('loading');
        this.editInventoryState
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
        this.editInventoryState.setSelectedInventories(data);
    }

    private async setupForm() {
        await this.operatorFiltersState.getCruiseLines();
        await this.operatorFiltersState.getPorts();
        await this.operatorFiltersState.getTours();

        // port is disabled and will be automatically updated based on selected tour
        this.editInventoryForm.controls.port.disable();
        this.editInventoryForm.controls.tour.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((tourId) => {
                const selectedTour = this.tours$
                    .getValue()
                    .find((tour) => tour.tourId === tourId);
                if (selectedTour?.portId) {
                    this.editInventoryForm.controls.port.setValue(
                        selectedTour.portId
                    );
                    this.editInventoryForm.controls.port.updateValueAndValidity();
                }
            });

        this.editInventoryForm.controls.cruiseLine.valueChanges
            .pipe(distinctUntilChanged(), takeUntil(this.destroyed$))
            .subscribe((cruiseLine) => {
                this.editInventoryForm.controls.cruiseShip.reset();
                if (
                    cruiseLine === -1 ||
                    cruiseLine === null ||
                    cruiseLine === undefined ||
                    cruiseLine === 0
                ) {
                    this.editInventoryForm.controls.cruiseShip.clearValidators();
                    this.editInventoryForm.controls.cruiseShip.disable();
                } else {
                    this.editInventoryForm.controls.cruiseShip.setValidators([
                        Validators.required,
                    ]);
                    this.editInventoryForm.controls.cruiseShip.enable();
                }
                this.editInventoryForm.controls.cruiseShip.updateValueAndValidity();
            });

        this.editInventoryForm.controls.frequency.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((frequency) => {
                if (frequency === 'Daily' || frequency === 'OneTime') {
                    this.editInventoryForm.controls.selectedDays.reset();
                }
                this.editInventoryForm.controls.selectedDays.updateValueAndValidity();
            });

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
                            this.editInventoryForm.controls.cruiseShip.clearValidators();
                            this.editInventoryForm.controls.cruiseShip.disable();
                        } else {
                            this.editInventoryForm.controls.cruiseShip.setValidators(
                                [Validators.required]
                            );
                            this.editInventoryForm.controls.cruiseShip.enable();
                        }
                    } else {
                        this.editInventoryForm.controls.cruiseShip.clearValidators();
                        this.editInventoryForm.controls.cruiseShip.disable();
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
                    this.editInventoryForm.patchValue({
                        cruiseLine:
                            appliedFilters.shipCompanyId != null
                                ? appliedFilters.shipCompanyId
                                : 0,
                        cruiseShip: appliedFilters.shipId || null,
                        tour: appliedFilters.tourId || null,
                        port: appliedFilters.portId || null,
                        fromDate: startDate || new Date(),
                        toDate: endDate || new Date(),
                        searchBy: appliedFilters.searchBy || 'ALL',
                    });
                }
            });
    }

    onCancel(): void {
        this.cancel.emit();
    }

    onNext(): void {
        this.next.emit();
    }

    private getToDate(): string {
        const formValues = this.editInventoryForm.getRawValue();
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
        const formValues = this.editInventoryForm.getRawValue();
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
        const formValues = this.editInventoryForm.getRawValue();
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
