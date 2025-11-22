import { Component, Input, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { UIState } from '../../state';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Features, UserQualificationListItem } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-special-licenses-table',
    templateUrl: './special-licenses-table.component.html',
    styleUrls: ['./special-licenses-table.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class SpecialLicensesTableComponent {
    uiState = inject(UIState);
    features = Features;
    @Input() specialLicenses: UserQualificationListItem[] = [];

    openEditLicenseModal(item: UserQualificationListItem) {
        this.uiState.openEditLicenseModal(item);
    }

    closeEditLicenseModal() {
        this.uiState.closeRemoveLicenseModal();
    }

    openRemoveLicenseModal(item: UserQualificationListItem) {
        this.uiState.openRemoveLicenseModal(item);
    }

    closeRemoveLicenseModal() {
        this.uiState.closeRemoveLicenseModal();
    }
}
