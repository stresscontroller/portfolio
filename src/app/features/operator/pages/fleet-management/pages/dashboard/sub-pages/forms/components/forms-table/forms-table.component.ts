import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { EquipmentTypeListItem } from '@app/core';
@Component({
    standalone: true,
    selector: 'app-forms-table',
    templateUrl: './forms-table.component.html',
    styleUrls: ['./forms-table.component.scss'],
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        TooltipModule,
    ],
})
export class FormsTableComponent {
    @Input() equipmentTypeList: EquipmentTypeListItem[] = [];
    ngOnInit(): void {}
}
