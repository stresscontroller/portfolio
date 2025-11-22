import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    BehaviorSubject,
    Subject,
    combineLatest,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
} from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

import { UIStatus, adjustDate } from '@app/core';
import { UIState, CruiseLinesState } from '../../../state';

interface Status {
    label: string;
    value: boolean;
}

@Component({
    standalone: true,
    selector: 'app-edit-ship-schedule-modal',
    templateUrl: './edit-ship-schedule.component.html',
    styleUrls: ['./edit-ship-schedule.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        CalendarModule,
        DropdownModule,
    ],
})
export class EditShipScheduleModalComponent {
    uiState = inject(UIState);
    cruiseLinesState = inject(CruiseLinesState);

    editShipSchedule$ = this.uiState.modals$.pipe(
        map((modals) => modals.editShipSchedule),
        distinctUntilChanged()
    );
    isOpen$ = this.editShipSchedule$.pipe(map((modal) => modal.isOpen));
    context$ = this.editShipSchedule$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    statusOption: Status[] = [
        { label: 'Active', value: true },
        {
            label: 'Inactive',
            value: false,
        },
    ];
    cruiseShipList$ = this.cruiseLinesState.cruiseShipList$;
    ports$ = this.cruiseLinesState.ports$;

    private destroyed$ = new Subject<void>();
    private shipId: number = 0;
    private shipScheduleId: number = 0;

    editShipScheduleForm = new FormGroup({
        portId: new FormControl<number | null>(null, [Validators.required]),
        isActive: new FormControl<boolean | null>(null, [Validators.required]),
        arrivalDate: new FormControl<Date | null>(null, [Validators.required]),
        arrivalTime: new FormControl<Date | null>(null, [Validators.required]),
        departureDate: new FormControl<Date | null>(null, [
            Validators.required,
        ]),
        departureTime: new FormControl<Date | null>(null, [
            Validators.required,
        ]),
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
            .subscribe(([shipSchedule]) => {
                if (shipSchedule) {
                    this.setupForm();
                }
            });
        this.cruiseLinesState.loadPorts();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.editShipScheduleForm.reset();
        this.uiState.closeEditShipScheduleModal();
    }

    private setupForm(): void {
        this.context$.subscribe((details) => {
            if (details) {
                this.shipId = details.shipId;
                this.shipScheduleId = details.shipScheduleId;
                this.editShipScheduleForm.patchValue({
                    ...details,
                    arrivalDate: details.arrivalDate
                        ? adjustDate(new Date(details.arrivalDate))
                        : new Date(),
                    arrivalTime: new Date(details.arrivalDate),
                    departureDate: details.departureDate
                        ? adjustDate(new Date(details.departureDate))
                        : new Date(),
                    departureTime: details.departureDate
                        ? this.getTime(details.departureDate)
                        : new Date(),
                });
            }
        });
    }

    getTime(dateString: string): Date {
        const dateValue = new Date(dateString);
        const hours = dateValue.getHours();
        const minutes = dateValue.getMinutes();
        const timeValue = new Date();
        timeValue.setHours(hours, minutes, 0, 0);
        return timeValue;
    }

    save(): void {
        if (this.editShipScheduleForm.invalid) {
            Object.values(this.editShipScheduleForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.editShipScheduleForm.getRawValue();
        const arrivalDate = this.getISODateTime(
            formValues.arrivalDate
                ? formatDate(
                      new Date(formValues.arrivalDate),
                      'YYYY-MM-dd',
                      'en-US'
                  )
                : '',
            formValues.arrivalTime
                ? formatDate(
                      new Date(formValues.arrivalTime),
                      'HH:mm:ss',
                      'en-US'
                  )
                : '00:00:00'
        );
        const departureDate = this.getISODateTime(
            formValues.departureDate
                ? formatDate(
                      new Date(formValues.departureDate),
                      'YYYY-MM-dd',
                      'en-US'
                  )
                : '',
            formValues.departureTime
                ? formatDate(
                      new Date(formValues.departureTime),
                      'HH:mm:ss',
                      'en-US'
                  )
                : '00:00:00'
        );
        this.cruiseLinesState
            .saveShipSchedule({
                shipScheduleId: this.shipScheduleId,
                shipId: this.shipId,
                portId: formValues.portId ?? 0,
                arrivalDate: arrivalDate,
                departureDate: departureDate,
                cruiseStartsOn: arrivalDate,
                cruiseEndsOn: departureDate,
                isActive: formValues.isActive ?? true,
                ref_Id: '',
                companyId: '',
            })
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    getISODateTime(dateString: string, timeString: string) {
        const combinedString = `${dateString}T${timeString}.000Z`;
        const date = new Date(combinedString);
        return date.toISOString();
    }
}
