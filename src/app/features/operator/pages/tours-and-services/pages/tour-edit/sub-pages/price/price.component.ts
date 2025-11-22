import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { UIState, TourPriceState } from './state';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { TourPriceTableComponent } from './components/tables';
import {
    AddNewTourPriceModalComponent,
    EditTourPriceModalComponent,
    RemoveTourPriceModalComponent,
} from './components/modals';
import { TourEditState } from '../../state';
import { Features } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-price',
    templateUrl: './price.component.html',
    styleUrls: ['./price.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        TourPriceTableComponent,
        AddNewTourPriceModalComponent,
        EditTourPriceModalComponent,
        RemoveTourPriceModalComponent,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
    providers: [UIState, TourPriceState],
})
export class PriceComponent {
    uiState = inject(UIState);
    tourPriceState = inject(TourPriceState);
    tourEditState = inject(TourEditState);

    features = Features;

    status$ = this.tourPriceState.status$;
    tourPrices$ = this.tourPriceState.tourPrices$;
    tourId$ = this.tourEditState.tourId$;

    ngOnInit(): void {
        this.tourPriceState.init();
    }

    refresh(): void {
        this.tourPriceState.refresh();
    }

    openAddNewTourPriceModal(tourId: number): void {
        this.uiState.openAddNewTourPriceModal(tourId);
    }
}
