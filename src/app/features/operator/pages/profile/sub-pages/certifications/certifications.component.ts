import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { CertificationsState, UIState } from './state';
import { CertificationTableComponent } from './components/tables/certification-table/certification-table.component';
import { Features } from '@app/core';
import { PermissionDirective } from '@app/shared';
import {
    AddNewCertificationsModalComponent,
    EditCertificationModalComponent,
    RemoveCertificationModalComponent,
} from './components/modals';

@Component({
    standalone: true,
    selector: 'app-certifications',
    templateUrl: './certifications.component.html',
    styleUrls: ['./certifications.component.scss'],
    imports: [
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        CommonModule,
        DropdownModule,
        CertificationTableComponent,
        PermissionDirective,
        AddNewCertificationsModalComponent,
        EditCertificationModalComponent,
        RemoveCertificationModalComponent,
    ],
    providers: [CertificationsState, UIState],
})
export class CertificationsComponent {
    features = Features;
    uiState = inject(UIState);

    openAddNewCertificationsModal(): void {
        this.uiState.openAddNewCertificationsModal();
    }
}
