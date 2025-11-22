import { Component, inject } from '@angular/core';
import { UIState, TourItineraryState } from '../../../state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TourItinerary, UIStatus } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-remove-tour-itinerary-modal',
    templateUrl: './remove-tour-itinerary.component.html',
    styleUrls: ['./remove-tour-itinerary.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveTourItineraryModalComponent {
    uiState = inject(UIState);
    tourItineraryState = inject(TourItineraryState);
    removeTourPrice$ = this.uiState.modals$.pipe(
        map((modals) => modals.removeTourItinerary),
        distinctUntilChanged()
    );

    isOpen$ = this.removeTourPrice$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeTourPrice$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    close(): void {
        this.status$.next('idle');
        this.uiState.closeRemoveTourItineraryModal();
    }
    delete(config: TourItinerary): void {
        this.status$.next('loading');
        this.tourItineraryState
            .deleteTourItinerary(config)
            .then(() => {
                this.status$.next('idle');
                this.tourItineraryState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
