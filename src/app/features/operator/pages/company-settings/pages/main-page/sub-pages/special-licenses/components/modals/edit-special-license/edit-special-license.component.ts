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
import { UIState, SpecialLicensesState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-edit-special-license-modal',
    templateUrl: './edit-special-license.component.html',
    styleUrls: ['./edit-special-license.component.scss'],
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
export class EditSpecialLicenseModalComponent {
    uiState = inject(UIState);
    specialLicensesState = inject(SpecialLicensesState);

    editSpecialLicense$ = this.uiState.modals$.pipe(
        map((modals) => modals.editSpecialLicense),
        distinctUntilChanged()
    );
    isOpen$ = this.editSpecialLicense$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    context$ = this.editSpecialLicense$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    specialLicenseId: number = 0;

    editSpecialLicenseForm = new FormGroup(
        {
            specialLcenseName: new FormControl<string | null>(null, [
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
        this.editSpecialLicenseForm
            .get('hasExpirationDate')
            ?.valueChanges.subscribe((checked) => {
                if (checked) {
                    this.notificationDaysFormControl(true);
                } else {
                    this.notificationDaysFormControl(false);
                }
            });
        this.context$.subscribe((context) => {
            if (context) {
                this.specialLicenseId = context.specialLicenseId;
                this.editSpecialLicenseForm.patchValue({
                    specialLcenseName: context.specialLicenseName,
                    hasExpirationDate: context.hasExpiry,
                    firstNotificationDays: context.firstNotificationDate,
                    secondNotificationDays: context.secondNotificationDate,
                });
            }
        });
    }

    notificationDaysFormControl(enable: boolean): void {
        if (enable) {
            this.editSpecialLicenseForm.get('firstNotificationDays')?.enable();
            this.editSpecialLicenseForm.get('secondNotificationDays')?.enable();
        } else {
            this.editSpecialLicenseForm.get('firstNotificationDays')?.disable();
            this.editSpecialLicenseForm
                .get('secondNotificationDays')
                ?.disable();
        }
    }

    save(): void {
        if (this.editSpecialLicenseForm.invalid) {
            Object.values(this.editSpecialLicenseForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');

        const formValues = this.editSpecialLicenseForm.getRawValue();

        this.specialLicensesState
            .saveSpecailLicense({
                specialLicenseId: this.specialLicenseId,
                specialLicenseName: formValues.specialLcenseName ?? '',
                companyUniqueId: '',
                isActive: true,
                hasExpiry: formValues.hasExpirationDate ?? false,
                isEmployeeApplicable: true,
                firstNotificationDate: formValues.firstNotificationDays ?? 0,
                secondNotificationDate: formValues.secondNotificationDays ?? 0,
                documentFile: 'test',
                userid: '',
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
        this.uiState.closeEditSpecialLicenseModal();
    }
}
