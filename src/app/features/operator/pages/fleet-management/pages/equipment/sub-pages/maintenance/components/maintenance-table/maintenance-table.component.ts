import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
@Component({
    standalone: true,
    selector: 'app-maintenance-table',
    templateUrl: './maintenance-table.component.html',
    styleUrls: ['./maintenance-table.component.scss'],
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        TooltipModule,
    ],
})
export class MaintenanceTableComponent {
    ngOnInit(): void {}

    openAddNewUsage(): void {}
}
