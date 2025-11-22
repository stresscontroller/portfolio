import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Features, RecentlyReleasedInventory, UIState } from '@app/core';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-inventory-table',
    templateUrl: './inventory-table.component.html',
    styleUrls: ['./inventory-table.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        CheckboxModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class InventoryTableComponent {
    @Input() inventories: RecentlyReleasedInventory[] = [];
    @Input() set selectedInventory(value: number[]) {
        this.selectedInventoryItems = value;
        if (this.selectedInventoryItems.length !== this.inventories.length) {
            this.selectAll = false;
        } else {
            this.selectAll = true;
        }
    }
    @Output() selectedInventoryChange = new EventEmitter<number[]>();
    @Output() notify = new EventEmitter<number>();
    @Output() dismiss = new EventEmitter<number>();

    uiState = inject(UIState);
    features = Features;
    selectedInventoryItems: number[] = [];
    selectAll = false;

    onCheckboxChange() {
        this.selectedInventoryChange.emit(this.selectedInventoryItems);
        if (this.selectedInventoryItems.length !== this.inventories.length) {
            this.selectAll = false;
        } else {
            this.selectAll = true;
        }
    }

    onSelectAllChange() {
        if (this.selectAll) {
            this.selectedInventoryItems = this.inventories.map(
                (item) => item.unallocatedTourInventoryID
            );
        } else {
            this.selectedInventoryItems = [];
        }
        this.selectedInventoryChange.emit(this.selectedInventoryItems);
    }

    onNotify(inventory: RecentlyReleasedInventory): void {
        this.notify.emit(inventory.unallocatedTourInventoryID);
    }

    onDismiss(inventory: RecentlyReleasedInventory): void {
        this.dismiss.emit(inventory.unallocatedTourInventoryID);
    }
}
