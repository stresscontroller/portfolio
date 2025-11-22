import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { AdminTourInventory, Features } from '@app/core';
import { PermissionDirective } from '@app/shared';
import { TourInventoryState, UIState } from '../../state';

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
        ButtonModule,
        TooltipModule,
        PermissionDirective,
        ProgressBarModule,
    ],
})
export class AvailableInventoryTableComponent {
    uiState = inject(UIState);
    tourInventoryState = inject(TourInventoryState);
    features = Features;
    manageAllocationInventories$ =
        this.tourInventoryState.manageAllocationInventories$.pipe(
            map((tourInventories) => {
                return tourInventories.data.map((inventory) => ({
                    ...inventory,
                    percentageSold: Math.floor(inventory.capacity),
                }));
            })
        );

    openEditTourInventoryModal(tourInventory: AdminTourInventory): void {
        this.uiState.openEditSelectedReleasedInventoryModal(tourInventory);
    }

    openDeleteTourInventoryModal(tourInventory: AdminTourInventory): void {
        this.uiState.openDeleteSelectedReleasedInventoryModal(tourInventory);
    }
}
