import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';

import { AddNewUsageModalComponent } from '../modals';
import { UIState } from '../../state';
@Component({
    standalone: true,
    selector: 'app-usage-table',
    templateUrl: './usage-table.component.html',
    styleUrls: ['./usage-table.component.scss'],
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        TooltipModule,
        AddNewUsageModalComponent,
    ],
    providers: [UIState],
})
export class UsageTableComponent {
    uiState = inject(UIState);
    ngOnInit(): void {}

    openAddNewUsage(): void {
        this.uiState.openAddNewUsageModal();
    }
}
