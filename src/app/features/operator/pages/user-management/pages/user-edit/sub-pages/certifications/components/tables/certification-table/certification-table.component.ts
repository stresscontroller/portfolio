import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { CertificationsState, UIState } from '../../../state';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Features, UserCertificationsData } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-certification-table',
    templateUrl: './certification-table.component.html',
    styleUrls: ['./certification-table.component.scss'],
    imports: [
        CommonModule,
        TableModule,
        CheckboxModule,
        FormsModule,
        ButtonModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class CertificationTableComponent {
    features = Features;
    certificationsState = inject(CertificationsState);
    uiState = inject(UIState);
    userCertifications$ = this.certificationsState.userCertifications$;

    ngOnInit(): void {
        this.certificationsState.init();
    }

    openEditCertificationModal(item: UserCertificationsData) {
        this.uiState.openEditCertificationsModal(item);
    }

    openRemoveCertificationModal(item: UserCertificationsData) {
        this.uiState.openRemoveCertificationsModal(item);
    }
}
