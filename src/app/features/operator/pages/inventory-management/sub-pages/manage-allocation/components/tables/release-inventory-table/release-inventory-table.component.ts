import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ReleaseInventoryListItem } from '@app/core';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-release-inventory-table',
    templateUrl: './release-inventory-table.component.html',
    styleUrls: ['./release-inventory-table.component.scss'],
    imports: [CommonModule, TableModule, CheckboxModule, FormsModule],
})
export class ReleaseInventoryTableComponent {
    @Input() availableReleaseInventory: ReleaseInventoryListItem[] = [];
    @Output() selectedReleaseInventory = new EventEmitter<number[]>();

    selectedReleaseInventoryItems: number[] = [];
    selectAll = false;

    onCheckboxChange() {
        this.selectedReleaseInventory.emit(this.selectedReleaseInventoryItems);
        if (
            this.selectedReleaseInventoryItems.length !==
            this.availableReleaseInventory.length
        ) {
            this.selectAll = false;
        } else {
            this.selectAll = true;
        }
    }

    onSelectAllChange() {
        if (this.selectAll) {
            this.selectedReleaseInventoryItems =
                this.availableReleaseInventory.map(
                    (item) => item.unallocatedTourInventoryID
                );
        } else {
            this.selectedReleaseInventoryItems = [];
        }
        this.selectedReleaseInventory.emit(this.selectedReleaseInventoryItems);
    }
}
