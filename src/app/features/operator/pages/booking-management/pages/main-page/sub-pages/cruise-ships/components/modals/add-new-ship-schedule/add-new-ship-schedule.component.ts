import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

import { UIStatus, dateRangeValidator } from '@app/core';
import { CruiseShipsState, UIState } from '../../../state';

interface Status {
    label: string;
    value: boolean;
}

@Component({
    standalone: true,
    selector: 'app-add-new-ship-schedule-modal',
    templateUrl: './add-new-ship-schedule.component.html',
    styleUrls: ['./add-new-ship-schedule.component.scss'],
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
export class AddNewShipScheduleModalComponent {
    uiState = inject(UIState);
    cruiseShipsState = inject(CruiseShipsState);
    addNewShipSchedule$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewShipSchedule),
        distinctUntilChanged()
    );

    isOpen$ = this.addNewShipSchedule$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    statusOption: Status[] = [
        { label: 'Active', value: true },
        {
            label: 'Inactive',
            value: false,
        },
    ];
    cruiseShipList$ = this.cruiseShipsState.cruiseShipList$;
    ports$ = this.cruiseShipsState.ports$;

    addShipScheduleForm = new FormGroup(
        {
            portId: new FormControl<number | null>(null, [Validators.required]),
            isActive: new FormControl<boolean>(true, [Validators.required]),
            arrivalDate: new FormControl<Date | null>(null, [
                Validators.required,
            ]),
            arrivalTime: new FormControl<Date | null>(null, [
                Validators.required,
            ]),
            departureDate: new FormControl<Date | null>(null, [
                Validators.required,
            ]),
            departureTime: new FormControl<Date | null>(null, [
                Validators.required,
            ]),
        },
        {
            validators: dateRangeValidator('arrivalDate', 'departureDate'),
        }
    );

    close() {
        this.reset();
        this.uiState.closeAddNewShipScheduleModal();
    }

    reset(): void {
        this.status$.next('idle');
    }

    add(): void {
        if (this.addShipScheduleForm.invalid) {
            Object.values(this.addShipScheduleForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.addShipScheduleForm.getRawValue();
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
        this.cruiseShipsState
            .saveShipSchedule({
                shipScheduleId: 0,
                shipId: this.cruiseShipsState.shipId$.value,
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
                this.close();
            });
    }

    getISODateTime(dateString: string, timeString: string) {
        const combinedString = `${dateString}T${timeString}.000Z`;
        const date = new Date(combinedString);
        return date.toISOString();
    }
}
