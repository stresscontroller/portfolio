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
import { AddNewLocationModalComponent } from './components/modals';
import { UIState, LocationsState } from './state';

@Component({
    standalone: true,
    selector: 'app-locations',
    templateUrl: './locations.component.html',
    styleUrls: ['./locations.component.scss'],
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
        AddNewLocationModalComponent,
    ],
    providers: [UIState, LocationsState],
})
export class LocationssComponent {
    @ViewChild('companyLocationsTable', { static: false })
    companyLocationsTable: Table | undefined;
    uiState = inject(UIState);
    locationsState = inject(LocationsState);

    private destroyed$ = new Subject<void>();
    keyword: string = '';

    selectedLocationType: string = '';

    statuses$ = this.locationsState.statuses$;
    locationType$ = this.locationsState.locationType$;
    locationList$ = this.locationsState.companyLocationList$;

    ngOnInit(): void {
        this.locationsState.init();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    changeLocationType(): void {
        this.locationsState.setLocationType(this.selectedLocationType ?? '');
    }

    search(): void {
        if (this.companyLocationsTable) {
            this.companyLocationsTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openAddNewLocationModal() {
        this.uiState.openAddNewLocationModal();
    }
}
