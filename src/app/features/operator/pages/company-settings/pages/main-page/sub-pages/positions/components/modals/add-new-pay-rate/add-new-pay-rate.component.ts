import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { UIStatus } from '@app/core';
import { UIState, PayRatesState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-add-new-pay-rate-modal',
    templateUrl: './add-new-pay-rate.component.html',
    styleUrls: ['./add-new-pay-rate.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
    ],
})
export class AddNewPayRateModalComponent {
    uiState = inject(UIState);
    payRatesState = inject(PayRatesState);
    addNewPayRate$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewPayRate),
        distinctUntilChanged()
    );
    isOpen$ = this.addNewPayRate$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    payType: string[] = ['Hourly', 'Annually'];

    addNewPayRateForm = new FormGroup({
        payrateYear: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        payRateAmount: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        payType: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        maxPayRateAmount: new FormControl<number | null>(null),
        maxPayType: new FormControl<string | null>(null),
    });

    add(): void {
        if (this.addNewPayRateForm.invalid) {
            Object.values(this.addNewPayRateForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.addNewPayRateForm.getRawValue();
        this.payRatesState
            .savePayRate({
                payRateMasterId: 0,
                positionId: 0,
                payrateYear: formValues.payrateYear ?? '0',
                payRateAmount: formValues.payRateAmount ?? 0,
                payType: formValues.payType ?? '',
                maxPayRateAmount: formValues.maxPayRateAmount ?? 0,
                maxPayType: formValues.maxPayType ?? '',
                companyUniqueId: '',
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
        this.uiState.closeAddNewPayRateModal();
        this.addNewPayRateForm.reset();
    }
}
