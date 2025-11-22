import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Features, TourPriceDetails } from '@app/core';
import { PermissionDirective } from '@app/shared';
import { TourPriceState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-price-table',
    templateUrl: './tour-price-table.component.html',
    styleUrls: ['./tour-price-table.component.scss'],
    imports: [
        CommonModule,
        TableModule,
        CheckboxModule,
        FormsModule,
        ButtonModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class TourPriceTableComponent {
    @Input() tourPrices: TourPriceDetails[] = [];

    tourPriceState = inject(TourPriceState);
    uiState = inject(UIState);

    features = Features;
    tourPrices$ = this.tourPriceState.tourPrices$;

    openEditTourPriceModal(item: TourPriceDetails): void {
        this.uiState.openEditTourPriceModal(item);
    }

    openRemoveTourPriceModal(item: TourPriceDetails): void {
        this.uiState.openRemoveTourPriceModal(item);
    }
}
