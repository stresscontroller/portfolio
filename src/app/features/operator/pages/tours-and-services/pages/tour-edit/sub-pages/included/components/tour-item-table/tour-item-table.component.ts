import { Component, Input, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { UIState } from '../../state';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Features, TourIncludedItem } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-tour-item-table',
    templateUrl: './tour-item-table.component.html',
    styleUrls: ['./tour-item-table.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class TourItemTableComponent {
    @Input() tourItems: TourIncludedItem[] = [];
    uiState = inject(UIState);
    features = Features;

    openEditTourIncludedModal(item: TourIncludedItem): void {
        this.uiState.openEditTourIncludedModal(item);
    }

    openRemoveTourIncludedModal(item: TourIncludedItem): void {
        this.uiState.openRemoveTourIncludedModal(item);
    }
}
