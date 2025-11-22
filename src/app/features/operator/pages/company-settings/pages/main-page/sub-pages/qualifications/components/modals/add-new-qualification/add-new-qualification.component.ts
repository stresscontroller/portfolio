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
import { map, distinctUntilChanged, BehaviorSubject } from 'rxjs';

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
    selector: 'app-add-new-qualification-modal',
    templateUrl: './add-new-qualification.component.html',
    styleUrls: ['./add-new-qualification.component.scss'],
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
export class AddNewQualificationModalComponent {
    uiState = inject(UIState);
    qualificationsState = inject(QualificationsState);
    addNewQualification$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewQualification),
        distinctUntilChanged()
    );
    isOpen$ = this.addNewQualification$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    qualificationType: string[] = ['Certification'];

    addNewQualificationForm = new FormGroup(
        {
            qualificationName: new FormControl<string | null>(null, [
                Validators.required,
            ]),
            qualificationType: new FormControl<string | null>(null, [
                Validators.required,
            ]),
            hasExpirationDate: new FormControl<boolean | null>(null),
            firstNotificationDays: new FormControl<number | null>(null),
            secondNotificationDays: new FormControl<number | null>(null),
        },
        {
            validators: this.notificationValidator(
                'firstNotificationDays',
                'secondNotificationDays'
            ),
        }
    );

    notificationValidator(
        firstNotificationDays: string,
        secondNotificationDays: string
    ): ValidatorFn {
        return (
            control: AbstractControl
        ): { [key: string]: boolean } | null => {
            const formGroup = control as FormGroup;
            const first = formGroup.controls[firstNotificationDays]?.value;
            const second = formGroup.controls[secondNotificationDays]?.value;
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
        this.notificationDaysFormControl(false);
        this.addNewQualificationForm
            .get('hasExpirationDate')
            ?.valueChanges.subscribe((checked) => {
                if (checked) {
                    this.notificationDaysFormControl(true);
                } else {
                    this.notificationDaysFormControl(false);
                }
            });
    }
    notificationDaysFormControl(enable: boolean): void {
        if (enable) {
            this.addNewQualificationForm.get('firstNotificationDays')?.enable();
            this.addNewQualificationForm
                .get('secondNotificationDays')
                ?.enable();
        } else {
            this.addNewQualificationForm
                .get('firstNotificationDays')
                ?.disable();
            this.addNewQualificationForm
                .get('secondNotificationDays')
                ?.disable();
        }
    }

    add(): void {
        if (this.addNewQualificationForm.invalid) {
            Object.values(this.addNewQualificationForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.addNewQualificationForm.getRawValue();
        this.qualificationsState
            .saveQualification({
                qualificationId: 0,
                qualificationName: formValues.qualificationName ?? '',
                companyUniqueId: '',
                isActive: true,
                qualificationType: formValues.qualificationType ?? '',
                hasExpiry: formValues.hasExpirationDate ?? false,
                isEmployeeApplicable: true,
                firstNotificationDate: formValues.firstNotificationDays ?? 0,
                secondNotificationDate: formValues.secondNotificationDays ?? 0,
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
        this.uiState.closeAddNewQualificationModal();
        this.addNewQualificationForm.reset();
    }
}
