import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TourInventoryItem } from '@app/core';
import { ButtonModule } from 'primeng/button';
@Component({
    standalone: true,
    selector: 'app-allocation-table',
    templateUrl: './allocation-table.component.html',
    styleUrls: ['./allocation-table.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        CheckboxModule,
        FormsModule,
        ButtonModule,
    ],
})
export class AllocationTableComponent {
    @Input() detailsInventory: TourInventoryItem[] = [];
    @Output() selectedInventory = new EventEmitter<string[]>();
    selectedInventoryItems: string[] = [];

    onCheckboxChange() {
        this.selectedInventory.emit(this.selectedInventoryItems);
    }
}
