import { Component, Input, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { UIState } from '../../../state';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Features, FileHeaderTextMapsItem } from '@app/core';
import { PermissionDirective } from '@app/shared';
@Component({
    standalone: true,
    selector: 'app-sales-report-table',
    templateUrl: './sales-report-table.component.html',
    styleUrls: ['./sales-report-table.component.scss'],
    imports: [
        TableModule,
        CommonModule,
        ButtonModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class SalesReportTableComponent {
    @Input() tableData: FileHeaderTextMapsItem[] | [] = [];
    uiState = inject(UIState);

    features = Features;

    openRemoveFileReportModal(shipCompanyId: number) {
        this.uiState.openRemoveFileReportModal(shipCompanyId);
    }

    openEditReportModal(item: FileHeaderTextMapsItem) {
        this.uiState.openEditReportModal(item);
    }

    closeRemoveFileReportModal() {
        this.uiState.closeRemoveFileReportModal();
    }
}
