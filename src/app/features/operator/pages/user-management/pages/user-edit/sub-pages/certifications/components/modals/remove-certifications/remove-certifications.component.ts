import { Component, inject } from '@angular/core';
import { UIState, CertificationsState } from '../../../state';
import { map, distinctUntilChanged, filter } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { UserCertificationsData } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-remove-certifications-modal',
    templateUrl: './remove-certifications.component.html',
    styleUrls: ['./remove-certifications.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveCertificationModalComponent {
    uiState = inject(UIState);
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
    close(): void {
        this.uiState.closeRemoveCertificationsModal();
    }
    delete(context: UserCertificationsData): void {
        this.certificationsState.deleteQualification(context).then(() => {
            this.certificationsState.refresh();
            this.close();
        });
    }
}
