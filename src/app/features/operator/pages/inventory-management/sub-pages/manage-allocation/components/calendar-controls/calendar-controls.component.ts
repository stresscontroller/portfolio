import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
    Subject,
    distinctUntilChanged,
    from,
    map,
    of,
    startWith,
    switchMap,
    takeUntil,
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { OperatorFiltersState, adjustDate } from '@app/core';
import { ManageAllocationState } from '../../state';
import { addMonths } from 'date-fns';

@Component({
    standalone: true,
    selector: 'app-calendar-controls',
    templateUrl: './calendar-controls.component.html',
    styleUrls: ['./calendar-controls.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        DropdownModule,
        MultiSelectModule,
        ReactiveFormsModule,
        CalendarModule,
    ],
})
export class CalendarControlsComponent {
    manageAllocationState = inject(ManageAllocationState);
    operatorFiltersState = inject(OperatorFiltersState);

    calendarControlsForm = new FormGroup({
        cruiseLine: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        ship: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        tours: new FormControl<number[] | null>(null, {
            nonNullable: true,
        }),
        port: new FormControl<number | null>(0, {
            nonNullable: true,
        }),
        startDate: new FormControl<Date | null>(new Date()),
        endDate: new FormControl<Date | null>(addMonths(new Date(), 1)),
        type: new FormControl<'ALL' | 'A' | 'UA' | 'R'>('ALL'),
    });

    allocationDataLoading$ =
        this.manageAllocationState.manageAllocationInventories$.pipe(
            map((data) => data.status === 'loading')
        );
    appliedFilters$ =
        this.manageAllocationState.manageAllocationInventories$.pipe(
            map((data) => data.config)
        );
    filterLoading$ = this.operatorFiltersState.isLoading$;
    cruiseLines$ = this.operatorFiltersState.cruiseLines$.pipe(
        map((cruiseLines) => {
            return [
                {
                    shipCompanyName: 'All Cruise Lines',
                    shipCompanyId: null,
                },
                ...cruiseLines,
            ];
        })
    );
    inventoryManagementInventoryType$ =
        this.operatorFiltersState.inventoryManagementInventoryType$;
    cruiseShips$ =
        this.calendarControlsForm.controls.cruiseLine.valueChanges.pipe(
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
    tours$ = this.operatorFiltersState.tours$;
    ports$ = this.operatorFiltersState.portsWithAll$;
    disableShipAndPort$ =
        this.calendarControlsForm.controls.type.valueChanges.pipe(
            startWith(this.calendarControlsForm.getRawValue().type),
            map((value) => {
                // disable ship and port as those will be ignored if the type is 'ALL' or 'UA' (unallocated)
                if (value === 'ALL' || value === 'UA') {
                    return true;
                }
                return false;
            })
        );

    private destroyed$ = new Subject<void>();

    async ngOnInit() {
        this.operatorFiltersState.getCruiseLines();
        this.operatorFiltersState.getPorts();
        await this.operatorFiltersState.getTours();

        this.appliedFilters$
            .pipe(
                distinctUntilChanged((prev, curr) => {
                    return JSON.stringify(prev) === JSON.stringify(curr);
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe(async (appliedFilters) => {
                if (appliedFilters) {
                    if (appliedFilters.shipCompanyId) {
                        await this.operatorFiltersState.getShipList(
                            appliedFilters.shipCompanyId
                        );
                    }
                    this.calendarControlsForm.patchValue({
                        cruiseLine: appliedFilters.shipCompanyId,
                        ship: appliedFilters.shipId || null,
                        tours:
                            appliedFilters.tourId &&
                            appliedFilters.tourId.length > 0
                                ? appliedFilters.tourId.map((tourId) => +tourId)
                                : this.tours$
                                      .getValue()
                                      ?.map((tour) => tour.tourId) || null,
                        port: appliedFilters.portId || 0,
                        startDate: appliedFilters.startDate
                            ? adjustDate(new Date(appliedFilters.startDate))
                            : new Date(),
                        endDate: appliedFilters.endDate
                            ? adjustDate(new Date(appliedFilters.endDate))
                            : new Date(),
                        type: appliedFilters.searchType || 'ALL',
                    });
                    if (
                        appliedFilters.shipCompanyId === null ||
                        appliedFilters.shipCompanyId === 0
                    ) {
                        this.calendarControlsForm.controls.ship.disable();
                    } else {
                        this.calendarControlsForm.controls.ship.enable();
                    }
                    this.calendarControlsForm.controls.ship.updateValueAndValidity();
                } else {
                    this.calendarControlsForm.patchValue({
                        tours:
                            this.tours$
                                .getValue()
                                ?.map((tour) => tour.tourId) || null,
                    });
                }
            });
        this.calendarControlsForm.controls.cruiseLine.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((cruiseLine) => {
                this.calendarControlsForm.controls.ship.setValue(null);
                if (cruiseLine === null || cruiseLine === 0) {
                    this.calendarControlsForm.controls.ship.disable();
                } else {
                    this.calendarControlsForm.controls.ship.enable();
                }
                this.calendarControlsForm.controls.ship.updateValueAndValidity();
            });
        this.calendarControlsForm.controls.startDate.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((startDate) => {
                if (startDate) {
                    // when a start date is selected, automatically set the end date
                    // to a one month from the selected start date
                    this.calendarControlsForm.patchValue({
                        endDate: addMonths(startDate, 1),
                    });
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    clearFilters(): void {
        this.calendarControlsForm.reset({}, { emitEvent: false });
    }

    onSubmit(): void {
        const formValues = this.calendarControlsForm.getRawValue();
        this.manageAllocationState.searchAllocations({
            searchType: formValues.type || 'ALL',
            companyId: '', // this will be populated later
            tourId:
                formValues.tours !== null
                    ? formValues.tours?.map((tour) => tour.toString())
                    : this.operatorFiltersState.tours$
                          .getValue()
                          .map((tour) => tour.tourId.toString()) || [],
            shipId: formValues.ship !== null ? formValues.ship : null,
            shipCompanyId:
                formValues.cruiseLine !== null ? formValues.cruiseLine : null,
            portId: formValues.port !== null ? formValues.port : 0,
            isActive: true,
            startDate: formValues.startDate
                ? formatDate(
                      new Date(formValues.startDate),
                      'YYYY-MM-dd',
                      'en-US'
                  )
                : '',
            endDate: formValues.endDate
                ? formatDate(
                      new Date(formValues.endDate),
                      'YYYY-MM-dd',
                      'en-US'
                  )
                : '',
        });
    }
}
