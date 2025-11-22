import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';

import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import {
    AddNewQualificationModalComponent,
    EditQualificationModalComponent,
    RemoveQualificationModalComponent,
} from './components/modals';
import { UIState, QualificationsState } from './state';
import { CompanyQualificationListItem } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-qualifications',
    templateUrl: './qualifications.component.html',
    styleUrls: ['./qualifications.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        TableModule,
        DropdownModule,
        TooltipModule,
        LoaderEmbedComponent,
        PermissionDirective,
        AddNewQualificationModalComponent,
        EditQualificationModalComponent,
        RemoveQualificationModalComponent,
    ],
    providers: [UIState, QualificationsState],
})
export class QualificationsComponent {
    @ViewChild('qualificationTable', { static: false })
    qualificationTable: Table | undefined;
    uiState = inject(UIState);
    qualificationsState = inject(QualificationsState);

    private destroyed$ = new Subject<void>();
    keyword: string = '';

    selectedLocationType: string = '';

    statuses$ = this.qualificationsState.statuses$;
    qualificationList$ = this.qualificationsState.qualificationList$;

    ngOnInit(): void {
        this.qualificationsState.init();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    search(): void {
        if (this.qualificationTable) {
            this.qualificationTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openAddNewQualificationModal() {
        this.uiState.openAddNewQualificationModal();
    }

    openEditQualificationModal(config: CompanyQualificationListItem) {
        this.uiState.openEditQualificationModal(config);
    }

    openRemoveQualificationModal(config: CompanyQualificationListItem) {
        this.uiState.openRemoveQualificationModal(config);
    }
}
