import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourInventoryItem } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-inventory-status-chip',
    templateUrl: './inventory-status-chip.component.html',
    styleUrls: ['./inventory-status-chip.component.scss'],
    imports: [CommonModule, FormsModule],
})
export class InventoryStatusChipComponent {
    @Input() set tourInventory(value: TourInventoryItem | undefined) {
        if (value) {
            if (value.isReleased === true) {
                this.status = 'released';
            } else if (value.shipId === null) {
                this.status = 'unallocated';
            } else {
                this.status = 'allocated';
            }
        }
    }

    status: 'unallocated' | 'allocated' | 'released' | undefined = undefined;

    statusConfig = {
        unallocated: {
            label: 'Unallocated',
            class: 'unallocated',
        },
        allocated: {
            label: 'Allocated',
            class: 'allocated',
        },
        released: {
            label: 'Released',
            class: 'released',
        },
    };
}
