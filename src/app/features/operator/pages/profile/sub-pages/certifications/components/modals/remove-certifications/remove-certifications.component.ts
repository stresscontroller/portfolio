import { Component, inject } from '@angular/core';
import { UIState, CertificationsState } from '../../../state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import {
    UIStatus,
    UserCertificationsData,
    UIState as RootUIState,
    ErrorDialogMessages,
} from '@app/core';

@Component({
    standalone: true,
    selector: 'app-remove-certifications-modal',
    templateUrl: './remove-certifications.component.html',
    styleUrls: ['./remove-certifications.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveCertificationModalComponent {
    uiState = inject(UIState);
    rootUIState = inject(RootUIState);
    certificationsState = inject(CertificationsState);
    removeCertifications$ = this.uiState.modals$.pipe(
        map((modals) => modals.removeCertifications),
        distinctUntilChanged()
    );

    isOpen$ = this.removeCertifications$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeCertifications$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    close(): void {
        this.status$.next('idle');
        this.uiState.closeRemoveCertificationsModal();
    }
    delete(context: UserCertificationsData): void {
        this.status$.next('loading');
        this.certificationsState
            .deleteQualification(context)
            .then(() => {
                this.certificationsState.refresh();
                this.close();
            })
            .catch(() => {
                this.rootUIState.openErrorDialog({
                    title: ErrorDialogMessages.userManagement
                        .certificationDeleteError.title,
                    description:
                        ErrorDialogMessages.userManagement
                            .certificationDeleteError.description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .certificationDeleteError.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                this.close();
                            },
                        },
                    ],
                });
            });
    }
}
