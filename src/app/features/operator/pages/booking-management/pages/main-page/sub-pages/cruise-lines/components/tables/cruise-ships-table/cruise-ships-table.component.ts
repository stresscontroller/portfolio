import { Component, Input, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CruiseShipListItem } from '@app/core';

import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { UIState, CruiseLinesState } from '../../../state';
import { CruiseShipScheduleModalComponent } from '../../modals/view-cruise-ship-details/view-cruise-ship-details.component';
import { RemoveCruiseShipModalComponent } from '../../modals/remove-cruise-ship/remove-cruise-ship.component';
@Component({
    standalone: true,
    selector: 'app-cruise-ships-table',
    templateUrl: './cruise-ships-table.component.html',
    styleUrls: ['./cruise-ships-table.component.scss'],
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        TooltipModule,
        CruiseShipScheduleModalComponent,
        RemoveCruiseShipModalComponent,
    ],
})
export class CruiseShipsTableComponent {
    @Input() keyword: string = '';
    @Input() cruiseShipList: CruiseShipListItem[] = [];
    @ViewChild('cruiseShipsTable', { static: false }) cruiseShipsTable:
        | Table
        | undefined;

    uiState = inject(UIState);
    cruiseLinesState = inject(CruiseLinesState);

    status$ = this.cruiseLinesState.status$;

    search(): void {
        if (this.cruiseShipsTable) {
            this.cruiseShipsTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openCruiseShipDetailsModal(config: CruiseShipListItem): void {
        this.uiState.openCruiseShipDetailsModal(config);
    }

    openRemoveCruiseShipModal(config: CruiseShipListItem): void {
        this.uiState.openRemoveCruiseShipModal(config);
    }
}
