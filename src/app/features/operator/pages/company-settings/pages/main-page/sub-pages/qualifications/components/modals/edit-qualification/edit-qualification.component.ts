import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    AbstractControl,
    ValidatorFn,
} from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, filter } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';

import { UIStatus } from '@app/core';
import { UIState, QualificationsState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-edit-qualification-modal',
    templateUrl: './edit-qualification.component.html',
    styleUrls: ['./edit-qualification.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        InputTextModule,
    ],
})
export class EditQualificationModalComponent {
    uiState = inject(UIState);
    qualificationsState = inject(QualificationsState);
    editQualification$ = this.uiState.modals$.pipe(
        map((modals) => modals.editQualification),
        distinctUntilChanged()
    );
    isOpen$ = this.editQualification$.pipe(map((modal) => modal.isOpen));
    context$ = this.editQualification$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    qualificationType: string[] = ['Certification'];
    qualificationId: number = 0;

    editQualificationForm = new FormGroup(
        {
            qualificationName: new FormControl<string | null>(null, [
                Validators.required,
            ]),
            qualificationType: new FormControl<string | null>(null, [
                Validators.required,
            ]),
            hasExpiry: new FormControl<boolean | null>(null),
            firstNotificationDate: new FormControl<number | null>(null),
            secondNotificationDate: new FormControl<number | null>(null),
        },
        {
            validators: this.notificationValidator(
                'firstNotificationDate',
                'secondNotificationDate'
            ),
        }
    );

    notificationValidator(
        firstNotificationDate: string,
        secondNotificationDate: string
    ): ValidatorFn {
        return (
            control: AbstractControl
        ): { [key: string]: boolean } | null => {
            const formGroup = control as FormGroup;
            const first = formGroup.controls[firstNotificationDate]?.value;
            const second = formGroup.controls[secondNotificationDate]?.value;
            if (!first || !second) {
                return null;
            }
            if (first && second) {
                return first < second ? null : { invalidDaysRange: true };
            }
            return null;
        };
    }

    ngOnInit(): void {
        this.editQualificationForm
            .get('hasExpiry')
            ?.valueChanges.subscribe((checked) => {
                if (checked) {
                    this.notificationDaysFormControl(true);
                } else {
                    this.notificationDaysFormControl(false);
                }
            });
        this.setupForm();
    }

    setupForm(): void {
        this.context$.subscribe((context) => {
            if (context) {
                this.qualificationId = context.qualificationId;
            }
            this.editQualificationForm.patchValue({
                ...context,
            });
        });
    }

    notificationDaysFormControl(enable: boolean): void {
        if (enable) {
            this.editQualificationForm.get('firstNotificationDate')?.enable();
            this.editQualificationForm.get('secondNotificationDate')?.enable();
        } else {
            this.editQualificationForm.get('firstNotificationDate')?.disable();
            this.editQualificationForm.get('secondNotificationDate')?.disable();
            this.editQualificationForm
                .get('firstNotificationDate')
                ?.setValue(null);
            this.editQualificationForm
                .get('secondNotificationDate')
                ?.setValue(null);
        }
    }

    save(): void {
        if (this.editQualificationForm.invalid) {
            Object.values(this.editQualificationForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.editQualificationForm.getRawValue();
        this.qualificationsState
            .saveQualification({
                qualificationId: this.qualificationId,
                qualificationName: formValues.qualificationName ?? '',
                companyUniqueId: '',
                isActive: true,
                qualificationType: formValues.qualificationType ?? '',
                hasExpiry: formValues.hasExpiry ?? false,
                isEmployeeApplicable: true,
                firstNotificationDate: formValues.hasExpiry
                    ? formValues.firstNotificationDate
                    : null,
                secondNotificationDate: formValues.hasExpiry
                    ? formValues.secondNotificationDate
                    : null,
            })
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeEditQualificationModal();
        this.editQualificationForm.reset();
    }
}
