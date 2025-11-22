import { Component, Input, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TourServiceListItem } from '@app/core';

import { Table, TableModule } from 'primeng/table';

import { CruiseLinesState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-tours-services-table',
    templateUrl: './tours-services-table.component.html',
    styleUrls: ['./tours-services-table.component.scss'],
    imports: [CommonModule, TableModule],
})
export class ToursServicesTableComponent {
    @Input() keyword: string = '';
    @Input() tourServiceList: TourServiceListItem[] = [];
    @ViewChild('cruiseLinesTable', { static: false }) cruiseLinesTable:
        | Table
        | undefined;

    cruiseLinesState = inject(CruiseLinesState);

    status$ = this.cruiseLinesState.status$;

    search(): void {
        if (this.cruiseLinesTable) {
            this.cruiseLinesTable.filterGlobal(this.keyword, 'contains');
        }
    }
}
