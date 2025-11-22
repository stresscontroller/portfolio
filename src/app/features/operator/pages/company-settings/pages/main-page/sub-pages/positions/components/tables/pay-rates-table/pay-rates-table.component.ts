import { Component, Input, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';

import { UIState, PositionsState } from '../../../state';

import { AddNewPayRateModalComponent } from '../../modals/add-new-pay-rate/add-new-pay-rate.component';
import { EditPayRateModalComponent } from '../../modals/edit-pay-rate/edit-pay-rate.component';
import { RemovePayRateModalComponent } from '../../modals/remove-pay-rate/remove-pay-rate.component';
import { PayRateListItem } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-pay-rates-table',
    templateUrl: './pay-rates-table.component.html',
    styleUrls: ['./pay-rates-table.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        TooltipModule,
        InputTextModule,
        AddNewPayRateModalComponent,
        EditPayRateModalComponent,
        RemovePayRateModalComponent,
    ],
})
export class PayRatesTableComponent {
    @Input() payRateList: PayRateListItem[] = [];
    @ViewChild('payRatesTable', { static: false }) payRatesTable:
        | Table
        | undefined;
    uiState = inject(UIState);
    positionsState = inject(PositionsState);
    statuses$ = this.positionsState.statuses$;
    keyword: string = '';

    search(): void {
        if (this.payRatesTable) {
            this.payRatesTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openAddNewPayRate(): void {
        this.uiState.openAddNewPayRateModal();
    }

    openEditPayRateModal(config: PayRateListItem): void {
        this.uiState.openEditPayRateModal(config);
    }

    openRemovePayRateModal(config: PayRateListItem): void {
        this.uiState.openRemovePayRateModal(config);
    }
}
