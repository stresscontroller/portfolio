import { Component, Input, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { UIState } from '../../../state';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Features, PortMapsItem } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-port-table',
    templateUrl: './port-table.component.html',
    styleUrls: ['./port-table.component.scss'],
    imports: [
        TableModule,
        CommonModule,
        ButtonModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class PortTableComponent {
    @Input() tableData: PortMapsItem[] = [];
    uiState = inject(UIState);

    features = Features;

    openRemovePortModal(item: PortMapsItem) {
        this.uiState.openRemovePortModal(item);
    }

    openEditPortModal(item: PortMapsItem) {
        this.uiState.openEditPortModal(item);
    }

    closeRemovePortModal() {
        this.uiState.closeRemovePortModal();
    }
}
