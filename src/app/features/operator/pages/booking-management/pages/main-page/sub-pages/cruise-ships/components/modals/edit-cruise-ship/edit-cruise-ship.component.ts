import { Component, ViewChild, inject } from '@angular/core';
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

import { UIStatus, CruiseShipConfig, adjustDate } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { UIState, CruiseShipsState } from '../../../state';
import { ShipSchedulesTableComponent } from '../../tables';
import { AddNewShipScheduleModalComponent } from '../../modals/add-new-ship-schedule/add-new-ship-schedule.component';

interface Status {
    label: string;
    value: number;
}

@Component({
    standalone: true,
    selector: 'app-edit-cruise-ship-modal',
    templateUrl: './edit-cruise-ship.component.html',
    styleUrls: ['./edit-cruise-ship.component.scss'],
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
        ShipSchedulesTableComponent,
        AddNewShipScheduleModalComponent,
    ],
})
export class EditCruiseShipModalComponent {
    @ViewChild(ShipSchedulesTableComponent)
    childComponent!: ShipSchedulesTableComponent;
    uiState = inject(UIState);
    cruiseShipState = inject(CruiseShipsState);

    editCruiseShip$ = this.uiState.modals$.pipe(
        map((modals) => modals.editCruiseShip),
        distinctUntilChanged()
    );
    isOpen$ = this.editCruiseShip$.pipe(map((modal) => modal.isOpen));
    context$ = this.editCruiseShip$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    scheduleStatus$ = this.cruiseShipState.status$;
    private destroyed$ = new Subject<void>();
    shipId$ = this.cruiseShipState.shipId$;
    cruiseShipDetails$ = this.cruiseShipState.cruiseShipDetails$;
    cruiseLineList$ = this.cruiseShipState.cruiseLineList$;
    upcomingShipScheduleList$ = this.cruiseShipState.upcomingShipScheduleList$;
    shipScheduleList$ = this.cruiseShipState.shipScheduleList$;
    private shipCompanyId: number | null = null;

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
                    this.shipId$.next(context.shipId);
                    if (context.dataSource === 'WIDGETY-API') {
                        this.editCruiseShipForm.disable();
                    } else {
                        this.editCruiseShipForm.enable();
                    }
                    this.cruiseShipState.loadCruiseShipDetails(context.shipId);
                }
            });
        this.setupForm();
        this.searchForm.valueChanges.subscribe(() => {
            const searchFormValue = this.searchForm.getRawValue();
            this.cruiseShipState.loadShipScheduleList(
                this.shipCompanyId ?? 0,
                searchFormValue.fromDate
                    ? searchFormValue.fromDate.toISOString()
                    : '',
                searchFormValue.toDate
                    ? searchFormValue.toDate.toISOString()
                    : ''
            );
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.editCruiseShipForm.reset();
        this.uiState.closeEditCruiseShipModal();
    }

    private setupForm(): void {
        this.cruiseShipDetails$.subscribe((details) => {
            if (details) {
                this.editCruiseShipForm.patchValue({
                    ...details,
                    shipStatus: details.shipStatus ?? 0,
                });
                this.shipCompanyId = details.shipCompanyId;
                this.cruiseShipState.loadShipScheduleList(
                    details.shipCompanyId,
                    this.getFirstDayOfLastMonth().toISOString(),
                    this.getLastDateOfSixMonthsLater().toISOString()
                );
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

    save(): void {
        if (this.editCruiseShipForm.invalid) {
            Object.values(this.editCruiseShipForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.editCruiseShipForm.getRawValue();
        const config: CruiseShipConfig = {
            shipId: this.shipId$.value,
            shipName: formValues.shipName ?? '',
            shipCompanyId: formValues.shipCompanyId ?? 0,
            capacity: formValues.capacity ?? 0,
            shipStatus: formValues.shipStatus ?? 0,
            currency: formValues.currency ?? '',
            launch_year: formValues.launch_year ?? 0,
            speed: formValues.speed ?? 0,
            deck_count: formValues.deck_count ?? 0,
            cabin_count: formValues.cabin_count ?? 0,
            language: formValues.language ?? '',
            crew_count: formValues.crew_count ?? 0,
            length: formValues.length ?? 0,
            width: formValues.width ?? 0,
            gross_tonnage: formValues.gross_tonnage ?? 0,
            companyId: '',
        };
        this.cruiseShipState
            .saveCruiseShip(config)
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    openAddNewShipScheduleModal(): void {
        this.uiState.openAddNewShipScheduleModal();
    }

    search(): void {
        if (this.childComponent) {
            this.childComponent.search();
        }
    }
}
