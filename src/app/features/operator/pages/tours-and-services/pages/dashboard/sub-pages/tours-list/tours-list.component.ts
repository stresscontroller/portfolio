import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TourDetails } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { TourListState, UIState } from './state';
import {
    AddNewTourModalComponent,
    RemoveTourModalComponent,
    RestoreTourModalComponent,
} from './components/modals';

@Component({
    standalone: true,
    selector: 'app-tours-list',
    templateUrl: './tours-list.component.html',
    styleUrls: ['./tours-list.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        LoaderEmbedComponent,
        PermissionDirective,
        FormsModule,
        ButtonModule,
        InputSwitchModule,
        InputTextModule,
        TableModule,
        AddNewTourModalComponent,
        RemoveTourModalComponent,
        RestoreTourModalComponent,
    ],
    providers: [UIState, TourListState],
})
export class ToursListComponent {
    @ViewChild('tourTable', { static: false }) tourTable: Table | undefined;

    tourListState = inject(TourListState);
    uiState = inject(UIState);
    tourList$ = this.tourListState.tours$;
    status$ = this.tourListState.status$;

    showInactive = false;
    keyword: string = '';

    ngOnInit(): void {
        this.tourListState.init();
    }

    search(): void {
        if (this.tourTable) {
            this.tourTable.filterGlobal(this.keyword, 'contains');
        }
    }

    showInactiveChange(): void {
        this.tourListState.setShowInactive(this.showInactive);
    }

    openAddNewTourModal(): void {
        this.uiState.openAddNewTourModal();
    }

    openEditTourModal(tour: TourDetails): void {
        this.uiState.openEditTourModal(tour);
    }

    openDeleteTourModal(tour: TourDetails): void {
        this.uiState.openDeleteTourModal(tour);
    }

    openRestoreTourModal(tour: TourDetails): void {
        this.uiState.openRestoreTourModal(tour);
    }
}
