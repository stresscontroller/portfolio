import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NeedingAllocationSelectedInventory } from '../../../../models';

@Component({
    standalone: true,
    selector: 'app-allocation-info',
    templateUrl: './allocation-info.component.html',
    styleUrls: ['./allocation-info.component.scss'],
    imports: [CommonModule],
})
export class AllocationInfoComponent {
    @Input() tour?: NeedingAllocationSelectedInventory;
    @Input() tourImage?: string;
}
