import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import {
    AddNewSpecialLicenseModalComponent,
    EditSpecialLicenseModalComponent,
    DeleteSpecialLicenseModalComponent,
} from './components/modals';
import { UIState, SpecialLicensesState } from './state';
import { CompanySpecialLicenseListItem } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-special-licenses',
    templateUrl: './special-licenses.component.html',
    styleUrls: ['./special-licenses.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        TableModule,
        LoaderEmbedComponent,
        PermissionDirective,
        AddNewSpecialLicenseModalComponent,
        EditSpecialLicenseModalComponent,
        DeleteSpecialLicenseModalComponent,
    ],
    providers: [UIState, SpecialLicensesState],
})
export class SpecialLicensesComponent {
    @ViewChild('specialLicenseTable', { static: false }) specialLicenseTable:
        | Table
        | undefined;
    uiState = inject(UIState);
    specialLicensesState = inject(SpecialLicensesState);

    statuses$ = this.specialLicensesState.statuses$;
    specialLicenseList$ = this.specialLicensesState.companySpecialLicenseList$;
    private destroyed$ = new Subject<void>();
    keyword: string = '';

    ngOnInit(): void {
        this.specialLicensesState.init();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    search(): void {
        if (this.specialLicenseTable) {
            this.specialLicenseTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openAddNewSpecialLicenseModal() {
        this.uiState.openAddNewSpecialLicenseModal();
    }

    openEditSpecialLicenseModal(config: CompanySpecialLicenseListItem) {
        this.uiState.openEditSpecialLicenseModal(config);
    }

    openRemoveSpecialLicenseModal(config: CompanySpecialLicenseListItem) {
        this.uiState.openRemoveSpecialLicenseModal(config);
    }
}
