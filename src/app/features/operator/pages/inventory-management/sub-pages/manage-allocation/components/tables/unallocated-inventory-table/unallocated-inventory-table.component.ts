import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TourInventoryItem } from '@app/core';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-unallocated-inventory-table',
    templateUrl: './unallocated-inventory-table.component.html',
    styleUrls: ['./unallocated-inventory-table.component.scss'],
    imports: [CommonModule, TableModule, CheckboxModule, FormsModule],
})
export class UnallocatedInventoryTableComponent {
    @Input() unallocatedInventory: TourInventoryItem[] = [];
    @Output() selectedUAInventory = new EventEmitter();

    selectedInventoryItems: number[] = [];
    selectAll = false;

    onCheckboxChange() {
        this.selectedUAInventory.emit(this.selectedInventoryItems);
        if (
            this.selectedInventoryItems.length !==
            this.unallocatedInventory.length
        ) {
            this.selectAll = false;
        } else {
            this.selectAll = true;
        }
    }

    onSelectAllChange() {
        if (this.selectAll) {
            this.selectedInventoryItems = this.unallocatedInventory.map(
                (item) => item.unallocatedTourInventoryID
            );
        } else {
            this.selectedInventoryItems = [];
        }
        this.selectedUAInventory.emit(this.selectedInventoryItems);
    }
}
