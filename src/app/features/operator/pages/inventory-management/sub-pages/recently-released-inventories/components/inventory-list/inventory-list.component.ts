import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { Features, RecentlyReleasedInventory } from '@app/core';
import { DividerModule } from 'primeng/divider';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-inventory-list',
    templateUrl: './inventory-list.component.html',
    styleUrls: ['./inventory-list.component.scss'],
    imports: [
        CommonModule,
        DataViewModule,
        ButtonModule,
        DividerModule,
        PermissionDirective,
    ],
})
export class InventoryListComponent {
    @Input() inventories: RecentlyReleasedInventory[] = [];
    @Output() notify = new EventEmitter<number>();
    @Output() dismiss = new EventEmitter<number>();
    features = Features;

    onNotify(inventory: RecentlyReleasedInventory): void {
        this.notify.emit(inventory.unallocatedTourInventoryID);
    }

    onDismiss(inventory: RecentlyReleasedInventory): void {
        this.dismiss.emit(inventory.unallocatedTourInventoryID);
    }
}
