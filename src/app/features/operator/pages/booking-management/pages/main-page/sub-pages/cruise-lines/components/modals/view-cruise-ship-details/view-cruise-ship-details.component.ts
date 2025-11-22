import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    FormsModule,
} from '@angular/forms';
import {
    map,
    distinctUntilChanged,
    BehaviorSubject,
    Subject,
    filter,
    takeUntil,
    switchMap,
    combineLatest,
} from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';

import { UIStatus, adjustDate } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { UIState, CruiseLinesState } from '../../../state';

interface Status {
    label: string;
    value: number;
}

@Component({
    standalone: true,
    selector: 'app-view-cruise-ship-details-modal',
    templateUrl: './view-cruise-ship-details.component.html',
    styleUrls: ['./view-cruise-ship-details.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        ButtonModule,
        CalendarModule,
        InputTextModule,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
})
export class CruiseShipScheduleModalComponent {
    uiState = inject(UIState);
    cruiseLineState = inject(CruiseLinesState);

    cruiseShipDetailsModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.cruiseShipDetails),
        distinctUntilChanged()
    );
    isOpen$ = this.cruiseShipDetailsModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.cruiseShipDetailsModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    scheduleStatus$ = this.cruiseLineState.status$;
    private destroyed$ = new Subject<void>();
    cruiseShipDetails$ = this.cruiseLineState.cruiseShipDetails$;
    cruiseLineList$ = this.cruiseLineState.cruiseLineList$;

    statusOption: Status[] = [
        { label: 'Active', value: 1 },
        {
            label: 'Inactive',
            value: 0,
        },
    ];

    editCruiseShipForm = new FormGroup({
        shipName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        shipCompanyId: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        capacity: new FormControl<number | null>(null),
        shipStatus: new FormControl<number | null>(null),
        currency: new FormControl<string | null>(null),
        launch_year: new FormControl<number | null>(null),
        speed: new FormControl<number | null>(null),
        deck_count: new FormControl<number | null>(null),
        cabin_count: new FormControl<number | null>(null),
        language: new FormControl<string | null>(null),
        crew_count: new FormControl<number | null>(null),
        length: new FormControl<number | null>(null),
        width: new FormControl<number | null>(null),
        gross_tonnage: new FormControl<number | null>(null),
        fromDate: new FormControl<Date | null>(null),
        toDate: new FormControl<Date | null>(null),
        keyword: new FormControl<string | null>(null),
    });

    keyword: string = '';

    searchForm = new FormGroup({
        fromDate: new FormControl<Date | null>(null, [Validators.required]),
        toDate: new FormControl<Date | null>(null, [Validators.required]),
    });

    ngOnInit(): void {
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return combineLatest([
                        this.context$.pipe(
                            distinctUntilChanged((prev, curr) => {
                                return (
                                    JSON.stringify(prev) ===
                                    JSON.stringify(curr)
                                );
                            })
                        ),
                        this.context$,
                    ]);
                })
            )
            .subscribe(([context]) => {
                if (context) {
                    this.editCruiseShipForm.disable();
                    this.cruiseLineState.loadCruiseShipDetails(context.shipId);
                }
            });
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.editCruiseShipForm.reset();
        this.uiState.closeCruiseShipDetailsModal();
    }

    private setupForm(): void {
        this.cruiseShipDetails$.subscribe((details) => {
            if (details) {
                this.editCruiseShipForm.patchValue({
                    ...details,
                    shipStatus: details.shipStatus ?? 0,
                });
            }
        });
        this.searchForm.patchValue({
            fromDate: adjustDate(new Date(this.getFirstDayOfLastMonth())),
            toDate: adjustDate(new Date(this.getLastDateOfSixMonthsLater())),
        });
    }
    getFirstDayOfLastMonth(): Date {
        const currentDate = new Date();
        const lastMonth = new Date(currentDate);
        lastMonth.setMonth(currentDate.getMonth() - 1);
        lastMonth.setDate(1);
        return lastMonth;
    }

    getLastDateOfSixMonthsLater(): Date {
        const currentDate = new Date();
        const sixMonthsLater = new Date(currentDate);
        sixMonthsLater.setMonth(currentDate.getMonth() + 6);
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 1);
        sixMonthsLater.setDate(0);
        return sixMonthsLater;
    }
}
