import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, filter } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { CompanyQualificationListItem, UIStatus } from '@app/core';
import { UIState, QualificationsState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-remove-qualification-modal',
    templateUrl: './remove-qualification.component.html',
    styleUrls: ['./remove-qualification.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
    ],
})
export class RemoveQualificationModalComponent {
    uiState = inject(UIState);
    qualificationsState = inject(QualificationsState);
    removeQualification$ = this.uiState.modals$.pipe(
        map((modals) => modals.removeQualification),
        distinctUntilChanged()
    );
    isOpen$ = this.removeQualification$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeQualification$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    remove(config: CompanyQualificationListItem): void {
        this.status$.next('loading');
        this.qualificationsState
            .deleteQualification(config.qualificationId, false)
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
        this.uiState.closeRemoveQualificationModal();
    }
}
