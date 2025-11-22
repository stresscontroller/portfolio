import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ReleaseInventoryListItem } from '@app/core';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-delete-inventory-table',
    templateUrl: './delete-inventory-table.component.html',
    styleUrls: ['./delete-inventory-table.component.scss'],
    imports: [CommonModule, TableModule, CheckboxModule, FormsModule],
})
export class DeleteInventoryTableComponent {
    @Input() availableInventory: ReleaseInventoryListItem[] = [];
    @Output() selectedInventory = new EventEmitter<number[]>();

    selectedInventoryItems: number[] = [];
    selectAll = false;

    onCheckboxChange() {
        this.selectedInventory.emit(this.selectedInventoryItems);
        if (
            this.selectedInventoryItems.length !==
            this.availableInventory.length
        ) {
            this.selectAll = false;
        } else {
            this.selectAll = true;
        }
    }

    onSelectAllChange() {
        if (this.selectAll) {
            this.selectedInventoryItems = this.availableInventory.map(
                (item) => item.unallocatedTourInventoryID
            );
        } else {
            this.selectedInventoryItems = [];
        }
        this.selectedInventory.emit(this.selectedInventoryItems);
    }
}
