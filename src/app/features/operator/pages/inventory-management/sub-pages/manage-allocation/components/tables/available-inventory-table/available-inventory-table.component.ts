import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ManageAllocationState } from '../../../state';
import { InventoryStatusChipComponent } from '../../inventory-status-chip/inventory-status-chip.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import {
    TableAllocateSelectedInventoryModalComponent,
    TableDeleteSelectedInventoryModalComponent,
    TableEditSelectedAllocatedInventoryModalComponent,
    TableEditSelectedUnallocatedInventoryModalComponent,
    TableReleaseSelectedInventoryModalComponent,
} from '../../modals/quick-actions';

import { Features, TourInventoryItem } from '@app/core';
import { UIState } from '../../../state';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-available-inventory-table',
    templateUrl: './available-inventory-table.component.html',
    styleUrls: ['./available-inventory-table.component.scss'],
    imports: [
        CommonModule,
        TableModule,
        CheckboxModule,
        FormsModule,
        InventoryStatusChipComponent,
        ButtonModule,
        TooltipModule,

        TableAllocateSelectedInventoryModalComponent,
        TableDeleteSelectedInventoryModalComponent,
        TableEditSelectedAllocatedInventoryModalComponent,
        TableEditSelectedUnallocatedInventoryModalComponent,
        TableReleaseSelectedInventoryModalComponent,
        PermissionDirective,
    ],
})
export class AvailableInventoryTableComponent {
    uiState = inject(UIState);
    manageAllocationState = inject(ManageAllocationState);
    features = Features;
    manageAllocationInventories$ =
        this.manageAllocationState.manageAllocationInventories$;

    openRemoveInventoryModal(item: TourInventoryItem) {
        this.uiState.openQuickDeleteSelectedInventoryModal(item);
    }

    closeRemoveInventoryModal() {
        this.uiState.closeQuickDeleteSelectedInventoryModal();
    }

    openAllocateInventoryModal(item: TourInventoryItem) {
        this.uiState.openQuickAllocateSelectedInventoryModal(item);
    }

    closeAllocateInventoryModal() {
        this.uiState.closeQuickAllocateSelectedInventoryModal();
    }

    openReleaseInventoryModal(item: TourInventoryItem) {
        this.uiState.openQuickReleaseSelectedInventoryModal(item);
    }

    closeReleaseInventoryModal() {
        this.uiState.closeQuickReleaseSelectedInventoryModal();
    }

    openEditInventoryModal(item: TourInventoryItem) {
        this.uiState.openQuickEditSelectedInventory(item);
    }

    closeEditAllocatedInventoryModal() {
        this.uiState.closeQuickEditSelectedInventory();
    }
}
