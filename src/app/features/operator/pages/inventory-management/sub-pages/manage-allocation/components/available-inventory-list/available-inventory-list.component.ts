import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { ManageAllocationState } from '../../state';
import { DividerModule } from 'primeng/divider';
import { InventoryStatusChipComponent } from '../inventory-status-chip/inventory-status-chip.component';
import { map } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-available-inventory-list',
    templateUrl: './available-inventory-list.component.html',
    styleUrls: ['./available-inventory-list.component.scss'],
    imports: [
        CommonModule,
        DataViewModule,
        ButtonModule,
        DividerModule,
        InventoryStatusChipComponent,
    ],
})
export class AvailableInventoryListComponent {
    manageAllocationState = inject(ManageAllocationState);
    manageAllocationInventories$ =
        this.manageAllocationState.manageAllocationInventories$.pipe(
            map((inventories) => inventories.data)
        );
}
