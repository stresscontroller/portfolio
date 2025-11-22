import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CruiseShipListItem } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { EditCruiseShipModalComponent } from './components/modals/edit-cruise-ship/edit-cruise-ship.component';
import { RemoveCruiseShipModalComponent } from './components/modals/remove-cruise-ship/remove-cruise-ship.component';
import { RestoreCruiseShipModalComponent } from './components/modals/restore-cruise-ship/restore-cruise-ship.component';
import { UIState, CruiseShipsState } from './state';

@Component({
    standalone: true,
    selector: 'app-cruise-ships',
    templateUrl: './cruise-ships.component.html',
    styleUrls: ['./cruise-ships.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        LoaderEmbedComponent,
        PermissionDirective,
        InputSwitchModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        EditCruiseShipModalComponent,
        RemoveCruiseShipModalComponent,
        RestoreCruiseShipModalComponent,
    ],
    providers: [UIState, CruiseShipsState],
})
export class CruiseShipsComponent {
    @ViewChild('cruiseShipsTable', { static: false }) cruiseShipsTable:
        | Table
        | undefined;

    uiState = inject(UIState);
    cruiseShipsState = inject(CruiseShipsState);

    status$ = this.cruiseShipsState.status$;
    cruiseShipList$ = this.cruiseShipsState.cruiseShipList$;

    keyword: string = '';
    showInactive = false;

    ngOnInit(): void {
        this.cruiseShipsState.init();
    }

    refresh(): void {
        this.cruiseShipsState.refresh();
    }

    showInactiveChange(): void {
        this.cruiseShipsState.setShowInactive(this.showInactive);
    }

    search(): void {
        if (this.cruiseShipsTable) {
            this.cruiseShipsTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openEditCruiseShipModal(config: CruiseShipListItem): void {
        this.uiState.openEditCruiseShipModal(config);
    }

    openRemoveCruiseShipModal(config: CruiseShipListItem): void {
        this.uiState.openRemoveCruiseShipModal(config);
    }

    openRestoreCruiseShipModal(config: CruiseShipListItem): void {
        this.uiState.openRestoreCruiseShipModal(config);
    }
}
