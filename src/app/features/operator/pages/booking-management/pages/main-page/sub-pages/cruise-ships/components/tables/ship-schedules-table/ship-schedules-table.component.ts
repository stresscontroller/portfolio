import { Component, Input, ViewChild, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CruiseShipScheduleListItem } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { EditShipScheduleModalComponent } from '../../modals/edit-ship-schedule/edit-ship-schedule.component';
import { RemoveShipScheduleModalComponent } from '../../modals/remove-ship-schedule/remove-ship-schedule.component';
import { UIState, CruiseShipsState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-ship-schedule-list-table',
    templateUrl: './ship-schedules-table.component.html',
    styleUrls: ['./ship-schedules-table.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        LoaderEmbedComponent,
        PermissionDirective,
        TableModule,
        ButtonModule,
        InputTextModule,
        EditShipScheduleModalComponent,
        RemoveShipScheduleModalComponent,
    ],
})
export class ShipSchedulesTableComponent {
    @Input() shipScheduleList: CruiseShipScheduleListItem[] = [];
    @Input() keyword: string = '';
    @ViewChild('shipScheduleTable', { static: false }) shipScheduleTable:
        | Table
        | undefined;
    uiState = inject(UIState);
    cruiseShipsState = inject(CruiseShipsState);

    status$ = this.cruiseShipsState.status$;

    ngOnInit(): void {
        this.cruiseShipsState.init();
    }

    getDate(date: Date): string {
        return formatDate(date, 'yyyy-MM-dd', 'en-US');
    }

    getTime(date: Date): string {
        return formatDate(date, 'HH:mm', 'en-US');
    }

    refresh(): void {
        this.cruiseShipsState.refresh();
    }

    openEditShipScheduleModal(config: CruiseShipScheduleListItem): void {
        this.uiState.openEditShipScheduleModal(config);
    }

    openRemoveShipScheduleModal(config: CruiseShipScheduleListItem): void {
        this.uiState.openRemoveShipScheduleModal(config);
    }

    search(): void {
        if (this.shipScheduleTable) {
            this.shipScheduleTable.filterGlobal(this.keyword, 'contains');
        }
    }
}
