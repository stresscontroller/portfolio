import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CruiseLineListItem } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

import {
    AddNewCruiseLineModalComponent,
    EditCruiseLineModalComponent,
    CruiseLineTourListModalComponent,
    RemoveCruiseLineModalComponent,
    RestoreCruiseLineModalComponent,
} from './components/modals';
import { UIState, CruiseLinesState } from './state';

@Component({
    standalone: true,
    selector: 'app-cruise-lines',
    templateUrl: './cruise-lines.component.html',
    styleUrls: ['./cruise-lines.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        LoaderEmbedComponent,
        PermissionDirective,
        InputSwitchModule,
        TableModule,
        ButtonModule,
        TooltipModule,
        InputTextModule,
        AddNewCruiseLineModalComponent,
        EditCruiseLineModalComponent,
        CruiseLineTourListModalComponent,
        RemoveCruiseLineModalComponent,
        RestoreCruiseLineModalComponent,
    ],
    providers: [UIState, CruiseLinesState],
})
export class CruiseLinesComponent {
    @ViewChild('cruiseLinesTable', { static: false }) cruiseLinesTable:
        | Table
        | undefined;

    uiState = inject(UIState);
    cruiseLinesState = inject(CruiseLinesState);

    status$ = this.cruiseLinesState.status$;
    cruiseLineList$ = this.cruiseLinesState.cruiseLineList$;

    keyword: string = '';
    showInactive = false;

    ngOnInit(): void {
        this.cruiseLinesState.init();
    }

    refresh(): void {
        this.cruiseLinesState.refresh();
    }

    showInactiveChange(): void {
        this.cruiseLinesState.setShowInactive(this.showInactive);
    }

    search(): void {
        if (this.cruiseLinesTable) {
            this.cruiseLinesTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openAddNewCruiseLineModal(): void {
        this.uiState.openAddNewCruiseLineModal();
    }

    openEditCruiseLineModal(config: CruiseLineListItem): void {
        this.uiState.openEditCruiseLineModal(config);
    }

    openTourServiceListModal(config: CruiseLineListItem): void {
        this.uiState.openTourServiceListModal(config);
    }

    openRemoveCruiseLineModal(config: CruiseLineListItem): void {
        this.uiState.openRemoveCruiseLineModal(config);
    }

    openRestoreCruiseLineModal(config: CruiseLineListItem): void {
        this.uiState.openRestoreCruiseLineModal(config);
    }
}
