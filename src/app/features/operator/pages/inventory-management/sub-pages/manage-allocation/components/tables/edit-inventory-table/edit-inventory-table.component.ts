import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TourInventoryItem } from '@app/core';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-edit-inventory-table',
    templateUrl: './edit-inventory-table.component.html',
    styleUrls: ['./edit-inventory-table.component.scss'],
    imports: [CommonModule, TableModule, CheckboxModule, FormsModule],
})
export class EditInventoryTableComponent {
    @Input() availableInventories: TourInventoryItem[] = [];
    @Input() set selectedInventories(val: number[]) {
        this.selectedInventoryItems = val;
    }
    @Output() selectInventories = new EventEmitter<number[]>();

    selectedInventoryItems: number[] = [];
    selectAll = false;

    onCheckboxChange() {
        this.selectInventories.emit(this.selectedInventoryItems);
        if (
            this.selectedInventoryItems.length !==
            this.availableInventories.length
        ) {
            this.selectAll = false;
        } else {
            this.selectAll = true;
        }
    }

    onSelectAllChange() {
        if (this.selectAll) {
            this.selectedInventoryItems = this.availableInventories.map(
                (inventory) => inventory.unallocatedTourInventoryID
            );
        } else {
            this.selectedInventoryItems = [];
        }
        this.selectInventories.emit(this.selectedInventoryItems);
    }
}
