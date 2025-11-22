import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, filter } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { UIState, PayRatesState } from '../../../state';
import { UIStatus } from '@app/core';
@Component({
    standalone: true,
    selector: 'app-remove-pay-rate-modal',
    templateUrl: './remove-pay-rate.component.html',
    styleUrls: ['./remove-pay-rate.component.scss'],
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
export class RemovePayRateModalComponent {
    uiState = inject(UIState);
    payRatesState = inject(PayRatesState);
    removePayRate$ = this.uiState.modals$.pipe(
        map((modals) => modals.removePayRate),
        distinctUntilChanged()
    );
    isOpen$ = this.removePayRate$.pipe(map((modal) => modal.isOpen));
    context$ = this.removePayRate$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    remove(payRateMasterId: number): void {
        this.status$.next('loading');
        this.payRatesState
            .deletePayRate(payRateMasterId, false)
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
        this.uiState.closeRemovePayRateModal();
    }
}
