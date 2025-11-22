import { Component, Input, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { UIState } from '../../../state';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Features, TourMapsItem } from '@app/core';
import { PermissionDirective } from '@app/shared';
@Component({
    standalone: true,
    selector: 'app-tour-table',
    templateUrl: './tour-table.component.html',
    styleUrls: ['./tour-table.component.scss'],
    imports: [
        TableModule,
        CommonModule,
        ButtonModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class TourTableComponent {
    @Input() tableData: TourMapsItem[] = [];
    uiState = inject(UIState);
    features = Features;

    openRemoveTourModal(item: TourMapsItem) {
        this.uiState.openRemoveTourModal(item);
    }

    openEditTourModal(item: TourMapsItem) {
        this.uiState.openEditTourModal(item);
    }

    closeRemoveTourModal() {
        this.uiState.closeRemoveTourModal();
    }
}
