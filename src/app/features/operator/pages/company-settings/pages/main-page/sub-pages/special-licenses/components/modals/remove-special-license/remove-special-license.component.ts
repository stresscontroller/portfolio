import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, filter } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { CompanySpecialLicenseListItem, UIStatus } from '@app/core';
import { UIState, SpecialLicensesState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-remove-special-license-modal',
    templateUrl: './remove-special-license.component.html',
    styleUrls: ['./remove-special-license.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
    ],
})
export class DeleteSpecialLicenseModalComponent {
    uiState = inject(UIState);
    specialLicensesState = inject(SpecialLicensesState);
    removeSpecialLicense$ = this.uiState.modals$.pipe(
        map((modals) => modals.removeSpecialLicense),
        distinctUntilChanged()
    );
    isOpen$ = this.removeSpecialLicense$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeSpecialLicense$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    remove(config: CompanySpecialLicenseListItem): void {
        this.status$.next('loading');
        this.specialLicensesState
            .deleteSpecialLicense(config.specialLicenseId, false)
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
        this.uiState.closeRemoveSpecialLicenseModal();
    }
}
