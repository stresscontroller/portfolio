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
import { UIState, SpecialLicensesState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-add-new-special-license-modal',
    templateUrl: './add-new-special-license.component.html',
    styleUrls: ['./add-new-special-license.component.scss'],
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
export class AddNewSpecialLicenseModalComponent {
    uiState = inject(UIState);
    specialLicensesState = inject(SpecialLicensesState);

    addNewSpecialLicense$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewSpecialLicense),
        distinctUntilChanged()
    );
    isOpen$ = this.addNewSpecialLicense$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');

    addNewSpecialLicenseForm = new FormGroup(
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
        this.addNewSpecialLicenseForm
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
            this.addNewSpecialLicenseForm
                .get('firstNotificationDays')
                ?.enable();
            this.addNewSpecialLicenseForm
                .get('secondNotificationDays')
                ?.enable();
        } else {
            this.addNewSpecialLicenseForm
                .get('firstNotificationDays')
                ?.disable();
            this.addNewSpecialLicenseForm
                .get('secondNotificationDays')
                ?.disable();
        }
    }

    add(): void {
        if (this.addNewSpecialLicenseForm.invalid) {
            Object.values(this.addNewSpecialLicenseForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');

        const formValues = this.addNewSpecialLicenseForm.getRawValue();

        this.specialLicensesState
            .saveSpecailLicense({
                specialLicenseId: 0,
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
        this.uiState.closeAddNewSpecialLicenseModal();
    }
}
