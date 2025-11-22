import { CommonModule, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
    UIState,
    ManageAllocationState,
    ManageUnallocationState,
} from '../../../state';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    map,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { OperatorFiltersState, UIStatus } from '@app/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    standalone: true,
    selector: 'app-add-unallocated-inventory-modal',
    templateUrl: './add-unallocated-inventory.component.html',
    styleUrls: ['./add-unallocated-inventory.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        InputTextModule,
        DropdownModule,
        RadioButtonModule,
        CalendarModule,
        InputNumberModule,
        CheckboxModule,
    ],
    providers: [ManageUnallocationState],
})
export class AddUnallocatedInventoryInventoryModalComponent {
    operatorFiltersState = inject(OperatorFiltersState);
    manageUnallocationState = inject(ManageUnallocationState);
    uiState = inject(UIState);
    manageAllocationState = inject(ManageAllocationState);
    tours$ = this.operatorFiltersState.tours$;
    status$ = new BehaviorSubject<UIStatus>('idle');

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

    addUnallocatedInventoryForm = new FormGroup({
        tour: new FormControl(null, {
            validators: Validators.required,
            nonNullable: true,
        }),
        seats: new FormControl(0, {
            validators: [Validators.required, Validators.min(1)],
        }),
        frequency: new FormControl<'OneTime' | 'Daily' | 'Weekly' | 'Biweekly'>(
            'OneTime',
            {
                nonNullable: true,
                validators: Validators.required,
            }
        ),
        fromDate: new FormControl('', { validators: Validators.required }),
        toDate: new FormControl(''),
        fromTime: new FormControl<Date | null>(null, {
            validators: Validators.required,
        }),
        toTime: new FormControl<Date | null>(null),
        hours: new FormControl('00', { nonNullable: true }),
        minutes: new FormControl('00', { nonNullable: true }),
        selectedDays: new FormControl<string[]>([], { nonNullable: true }),
    });

    defaultTime = new Date(new Date().setHours(8, 0, 0, 0));

    addUnallocatedInventory$ = this.uiState.modals$.pipe(
        map((modals) => modals.addUnallocatedInventory),
        distinctUntilChanged()
    );

    isOpen$ = this.addUnallocatedInventory$.pipe(map((modal) => modal.isOpen));

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.operatorFiltersState.getPorts();
        this.operatorFiltersState.getTours();
        this.addUnallocatedInventoryForm.controls.frequency.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((frequency) => {
                if (frequency === 'Daily' || frequency === 'OneTime') {
                    this.addUnallocatedInventoryForm.controls.selectedDays.reset();
                }
                if (frequency !== 'OneTime') {
                    this.addUnallocatedInventoryForm.controls.toDate.setValidators(
                        [Validators.required]
                    );
                    this.addUnallocatedInventoryForm.controls.toTime.setValidators(
                        [Validators.required]
                    );
                    this.addUnallocatedInventoryForm.controls.hours.setValidators(
                        [Validators.required]
                    );
                    this.addUnallocatedInventoryForm.controls.minutes.setValidators(
                        [Validators.required]
                    );
                } else {
                    this.addUnallocatedInventoryForm.controls.toDate.clearValidators();
                    this.addUnallocatedInventoryForm.controls.toTime.clearValidators();
                    this.addUnallocatedInventoryForm.controls.hours.clearValidators();
                    this.addUnallocatedInventoryForm.controls.minutes.clearValidators();
                }
                this.addUnallocatedInventoryForm.controls.toDate.updateValueAndValidity();
                this.addUnallocatedInventoryForm.controls.toTime.updateValueAndValidity();
                this.addUnallocatedInventoryForm.controls.hours.updateValueAndValidity();
                this.addUnallocatedInventoryForm.controls.minutes.updateValueAndValidity();
                this.addUnallocatedInventoryForm.controls.selectedDays.updateValueAndValidity();
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
        if (!this.addUnallocatedInventoryForm.controls.fromTime.getRawValue()) {
            this.addUnallocatedInventoryForm.controls.fromTime.setValue(
                this.defaultTime
            );
        }
    }

    focusToTime(): void {
        if (!this.addUnallocatedInventoryForm.controls.toTime.getRawValue()) {
            this.addUnallocatedInventoryForm.controls.toTime.setValue(
                this.defaultTime
            );
        }
    }

    close(): void {
        this.uiState.closeAddUnallocatedInventoryModal();
        this.addUnallocatedInventoryForm.reset();
    }

    save(): void {
        if (this.addUnallocatedInventoryForm.invalid) {
            Object.values(this.addUnallocatedInventoryForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.addUnallocatedInventoryForm.getRawValue();
        this.status$.next('loading');
        this.manageUnallocationState
            .saveUnallocatedTourInventory({
                startDate: formValues.fromDate
                    ? formatDate(
                          new Date(formValues.fromDate),
                          'YYYY-MM-dd',
                          'en-US'
                      )
                    : '',
                endDate: formValues.toDate
                    ? formatDate(
                          new Date(formValues.toDate),
                          'YYYY-MM-dd',
                          'en-US'
                      )
                    : '',
                unallocatedTourInventoryDate: formValues.fromDate
                    ? formatDate(
                          new Date(formValues.fromDate),
                          'YYYY-MM-dd',
                          'en-US'
                      )
                    : '',
                unallocatedTourInventoryAllocatedSeats: formValues.seats || 0,
                isReleased: false,
                frequency: this.getFrequency(),
                isRecurranceUpdate:
                    formValues.frequency === 'OneTime' ? false : true,
                tourID: formValues.tour ? +formValues.tour : 0,
                unallocatedTourInventoryTime: formValues.fromTime
                    ? formatDate(
                          new Date(formValues.fromTime),
                          'HH:mm',
                          'en-US'
                      )
                    : '',
                unallocatedTourEndTime: formValues.toTime
                    ? formatDate(new Date(formValues.toTime), 'HH:mm', 'en-US')
                    : '',
                intervalHours:
                    formValues.hours.length === 1
                        ? `0${formValues.hours}`
                        : formValues.hours,
                intervalMinutes:
                    formValues.minutes.length === 1
                        ? `0${formValues.minutes}`
                        : formValues.minutes,
                companyId: '',
                days:
                    formValues.frequency !== 'OneTime' &&
                    formValues.frequency !== 'Daily'
                        ? formValues.selectedDays.join(',')
                        : '',
            })
            .then(() => {
                this.status$.next('idle');
                this.manageAllocationState.reload();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    getFrequency(): string {
        const formValues = this.addUnallocatedInventoryForm.getRawValue();
        if (formValues.frequency === 'Weekly') {
            return 'Daily';
        }
        return formValues.frequency;
    }
}
