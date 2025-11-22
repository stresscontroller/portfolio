import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, filter } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { UIStatus } from '@app/core';
import { UIState, PayRatesState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-edit-pay-rate-modal',
    templateUrl: './edit-pay-rate.component.html',
    styleUrls: ['./edit-pay-rate.component.scss'],
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
export class EditPayRateModalComponent {
    uiState = inject(UIState);
    payRatesState = inject(PayRatesState);
    editPayRate$ = this.uiState.modals$.pipe(
        map((modals) => modals.editPayRate),
        distinctUntilChanged()
    );
    isOpen$ = this.editPayRate$.pipe(map((modal) => modal.isOpen));
    context$ = this.editPayRate$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    payType: string[] = ['Hourly', 'Annually'];

    editPayRateForm = new FormGroup({
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

    ngOnInit(): void {
        this.context$.subscribe((detail) => {
            this.editPayRateForm.patchValue({
                ...detail,
            });
        });
    }

    save(): void {
        if (this.editPayRateForm.invalid) {
            Object.values(this.editPayRateForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        this.status$.next('loading');
        const formValues = this.editPayRateForm.getRawValue();
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
        this.uiState.closeEditPayRateModal();
        this.editPayRateForm.reset();
    }
}
