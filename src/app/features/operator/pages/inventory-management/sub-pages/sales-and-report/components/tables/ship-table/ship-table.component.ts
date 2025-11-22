import { Component, Input, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { UIState } from '../../../state';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Features, ShipCompanyShipMapsItem } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-ship-table',
    templateUrl: './ship-table.component.html',
    styleUrls: ['./ship-table.component.scss'],
    imports: [
        TableModule,
        CommonModule,
        ButtonModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class ShipTableComponent {
    @Input() tableData: ShipCompanyShipMapsItem[] = [];
    uiState = inject(UIState);

    features = Features;

    openRemoveShipModal(item: ShipCompanyShipMapsItem) {
        this.uiState.openRemoveShipModal(item);
    }

    openEditShipModal(item: ShipCompanyShipMapsItem) {
        this.uiState.openEditShipModal(item);
    }

    closeRemoveShipModal() {
        this.uiState.closeRemoveShipModal();
    }
}
