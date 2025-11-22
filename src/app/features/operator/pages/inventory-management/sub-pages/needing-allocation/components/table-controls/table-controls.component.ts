import { CommonModule, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { AllocationState } from '../../state';
import {
    NeededAllocationTourInventoryFilters,
    OperatorFiltersState,
    adjustDate,
} from '@app/core';
import { Subject, distinctUntilChanged, map, takeUntil } from 'rxjs';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { addYears } from 'date-fns';

@Component({
    standalone: true,
    selector: 'app-table-controls',
    templateUrl: './table-controls.component.html',
    styleUrls: ['./table-controls.component.scss'],
    imports: [
        CommonModule,
        DropdownModule,
        MultiSelectModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarModule,
        RadioButtonModule,
        CheckboxModule,
        InputNumberModule,
    ],
})
export class TableControlsComponent {
    needingAllocationState = inject(AllocationState);
    operatorFiltersState = inject(OperatorFiltersState);
    today = new Date();
    allocationControls = new FormGroup({
        port: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        tours: new FormControl<number[] | null>(null, {
            nonNullable: true,
        }),
        startDate: new FormControl<Date | null>(new Date()),
        endDate: new FormControl<Date | null>(this.getEndDate(new Date())),
        inventoryType: new FormControl(''),
        optionRadio: new FormControl<'threshold' | 'seats'>('threshold'),
        thresholdPercentage: new FormControl<number>(0),
        seatsAvailable: new FormControl<number>(0),
    });

    allocationDataLoading$ =
        this.needingAllocationState.needingAllocationStatus$.pipe(
            map(
                (data) =>
                    data.inventories === 'loading' ||
                    data.reminders === 'loading'
            )
        );

    appliedFilters$ = this.needingAllocationState.needingAllocationConfig$.pipe(
        map((data) => data.filter)
    );
    filterLoading$ = this.operatorFiltersState.isLoading$;
    ports$ = this.operatorFiltersState.ports$;
    tours$ = this.operatorFiltersState.tours$;

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.operatorFiltersState.getPorts();
        this.operatorFiltersState.getTours();

        this.appliedFilters$
            .pipe(
                distinctUntilChanged((prev, curr) => {
                    return JSON.stringify(prev) === JSON.stringify(curr);
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe(async (appliedFilters) => {
                if (appliedFilters) {
                    this.allocationControls.patchValue({
                        tours:
                            appliedFilters.tourIDs?.map((tourId) => +tourId) ||
                            null,
                        port: appliedFilters.portId || 0,
                        startDate:
                            adjustDate(new Date(appliedFilters.startDate)) ||
                            new Date(),
                        // don't overwrite the enddate if it exists prior
                        endDate: appliedFilters.endDate
                            ? adjustDate(new Date(appliedFilters.endDate))
                            : this.getEndDate(
                                  appliedFilters.startDate
                                      ? new Date(appliedFilters.startDate)
                                      : new Date()
                              ),
                        thresholdPercentage:
                            appliedFilters.usePercentage === null
                                ? 80
                                : appliedFilters.usePercentage,
                        seatsAvailable: appliedFilters.useSeats || 0,
                        optionRadio:
                            appliedFilters.isUsePercentage == true
                                ? 'threshold'
                                : 'seats',
                    });
                } else {
                    const today = new Date();
                    this.allocationControls.patchValue({
                        tours: null,
                        port: 0,
                        startDate: today,
                        endDate: new Date(
                            today.setFullYear(today.getFullYear() + 1)
                        ),
                        thresholdPercentage: 80,
                        seatsAvailable: 0,
                        optionRadio: 'threshold',
                    });
                }
            });

        this.allocationControls.controls.startDate.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((startDate) => {
                if (startDate) {
                    // when a start date is selected, automatically set the end date
                    // to a one month from the selected start date
                    this.allocationControls.patchValue({
                        endDate: addYears(startDate, 1),
                    });
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    clearFilters(): void {
        this.allocationControls.reset({}, { emitEvent: false });
    }

    submit(): void {
        this.needingAllocationState.searchNeedingAllocations(
            this.getFormattedFilters()
        );
    }

    savePreference(): void {
        const filters = this.getFormattedFilters();
        this.needingAllocationState.saveNeededAllocationUserPreference({
            startDate: filters.startDate,
            endDate: filters.endDate,
            isUsePercentage: filters.isUsePercentage === true,
            usePercentage: filters.usePercentage || 0,
            isUseSeats: filters.isUseSeats === true,
            useSeats: filters.useSeats || 0,
        });
    }

    private getFormattedFilters(): NeededAllocationTourInventoryFilters {
        const formValues = this.allocationControls.getRawValue();
        const formattedFilters: NeededAllocationTourInventoryFilters = {
            startDate: new Date().toDateString(),
            endDate: new Date().toDateString(),
        };

        if (formValues.port) {
            formattedFilters.portId = formValues.port;
        } else {
            formattedFilters.portId = 0;
        }

        if (formValues.tours && formValues.tours.length > 0) {
            formattedFilters.tourIDs = formValues.tours.map((tourId) =>
                tourId.toString()
            );
        } else {
            formattedFilters.tourIDs = [];
        }

        formattedFilters.startDate = formValues.startDate
            ? formatDate(new Date(formValues.startDate), 'YYYY-MM-dd', 'en-US')
            : formatDate(new Date(), 'YYYY-MM-dd', 'en-US');
        formattedFilters.endDate = formValues.endDate
            ? formatDate(new Date(formValues.endDate), 'YYYY-MM-dd', 'en-US')
            : formatDate(new Date(), 'YYYY-MM-dd', 'en-US');

        formattedFilters.isUsePercentage =
            formValues.optionRadio == 'threshold' ? true : false;
        formattedFilters.isUseSeats =
            formValues.optionRadio == 'seats' ? true : false;
        formattedFilters.usePercentage = formValues.thresholdPercentage || 0;
        formattedFilters.useSeats = formValues.seatsAvailable || 0;

        return formattedFilters;
    }

    private getEndDate(startDate?: Date): Date {
        if (startDate) {
            return adjustDate(
                new Date(startDate.setFullYear(startDate.getFullYear() + 1))
            );
        }
        const today = new Date();
        return adjustDate(new Date(today.setFullYear(today.getFullYear() + 1)));
    }
}
