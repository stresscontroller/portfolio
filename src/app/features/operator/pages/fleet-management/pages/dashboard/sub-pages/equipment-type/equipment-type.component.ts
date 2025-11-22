import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentTypeListItem } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import {
    AddNewEquipmentTypeModalComponent,
    EditEquipmentTypeModalComponent,
    RemoveEquipmentTypeModalComponent,
    RestoreEquipmentTypeModalComponent,
} from './components/modals';
import { UIState, EquipmentTypeState } from './state';

@Component({
    standalone: true,
    selector: 'app-equipment-type',
    templateUrl: './equipment-type.component.html',
    styleUrls: ['./equipment-type.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        LoaderEmbedComponent,
        PermissionDirective,
        InputSwitchModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        AddNewEquipmentTypeModalComponent,
        EditEquipmentTypeModalComponent,
        RemoveEquipmentTypeModalComponent,
        RestoreEquipmentTypeModalComponent,
    ],
    providers: [UIState, EquipmentTypeState],
})
export class EquipmentTypeComponent {
    @ViewChild('equipmentTypeTable', { static: false }) equipmentTypeTable:
        | Table
        | undefined;

    uiState = inject(UIState);
    equipmentTypeState = inject(EquipmentTypeState);

    status$ = this.equipmentTypeState.status$;
    equipmentTypeList$ = this.equipmentTypeState.equipmentTypeList$;

    keyword: string = '';
    showInactive = false;

    ngOnInit(): void {
        this.equipmentTypeState.init();
    }

    refresh(): void {
        this.equipmentTypeState.refresh();
    }

    showInactiveChange(): void {
        this.equipmentTypeState.setShowInactive(this.showInactive);
    }

    search(): void {
        if (this.equipmentTypeTable) {
            this.equipmentTypeTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openAddNewEquipmentTypeModal() {
        this.uiState.openAddNewEquipmentTypeModal();
    }

    openEditEquipmentTypeModal(config: EquipmentTypeListItem) {
        this.uiState.openEditEquipmentTypeModal(config);
    }

    openRemoveEquipmentTypeModal(config: EquipmentTypeListItem) {
        this.uiState.openRemoveEquipmentTypeModal(config);
    }

    openRestoreEquipmentTypeModal(config: EquipmentTypeListItem): void {
        this.uiState.openRestoreEquipmentTypeModal(config);
    }
}
