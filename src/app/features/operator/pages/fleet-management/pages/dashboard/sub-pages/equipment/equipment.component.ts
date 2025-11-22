import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { EquipmentListItem } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import {
    AddNewEquipmentModalComponent,
    RemoveEquipmentModalComponent,
    RestoreEquipmentModalComponent,
} from './components/modals';
import { UIState, EquipmentsState } from './state';

@Component({
    standalone: true,
    selector: 'app-equipment',
    templateUrl: './equipment.component.html',
    styleUrls: ['./equipment.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        InputSwitchModule,
        TableModule,
        LoaderEmbedComponent,
        PermissionDirective,
        AddNewEquipmentModalComponent,
        RemoveEquipmentModalComponent,
        RestoreEquipmentModalComponent,
    ],
    providers: [UIState, EquipmentsState],
})
export class EquipmentComponent {
    @ViewChild('equipmentTable', { static: false }) equipmentTable:
        | Table
        | undefined;

    uiState = inject(UIState);
    equipmentsState = inject(EquipmentsState);

    status$ = this.equipmentsState.status$;
    equipmentList$ = this.equipmentsState.equipmentList$;

    keyword: string = '';
    showInactive = false;

    ngOnInit(): void {
        this.equipmentsState.init();
    }

    refresh(): void {
        this.equipmentsState.refresh();
    }

    showInactiveChange(): void {
        this.equipmentsState.setShowInactive(this.showInactive);
    }

    search(): void {
        if (this.equipmentTable) {
            this.equipmentTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openAddNewEquipmentModal() {
        this.uiState.openAddNewEquipmentModal();
    }

    openRemoveEquipmentModal(config: EquipmentListItem) {
        this.uiState.openRemoveEquipmentModal(config);
    }

    openRestoreEquipmentModal(config: EquipmentListItem): void {
        this.uiState.openRestoreEquipmentModal(config);
    }
}
