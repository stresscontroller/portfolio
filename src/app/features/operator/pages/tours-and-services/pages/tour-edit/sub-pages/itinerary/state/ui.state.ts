import { Injectable } from '@angular/core';
import { TourItinerary } from '@app/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewTourItinerary: {
            isOpen: boolean;
        };
        editTourItinerary: {
            isOpen: boolean;
            context?: TourItinerary;
        };
        removeTourItinerary: {
            isOpen: boolean;
            context?: TourItinerary;
        };
    }>({
        addNewTourItinerary: {
            isOpen: false,
        },
        editTourItinerary: {
            isOpen: false,
        },
        removeTourItinerary: {
            isOpen: false,
        },
    });

    openAddNewTourItineraryModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewTourItinerary: {
                isOpen: true,
            },
        });
    }

    closeAddNewTourItineraryModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewTourItinerary: {
                isOpen: false,
            },
        });
    }

    openEditTourItineraryModal(context: TourItinerary) {
        this.modals$.next({
            ...this.modals$.value,
            editTourItinerary: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditTourItineraryModal() {
        this.modals$.next({
            ...this.modals$.value,
            editTourItinerary: {
                isOpen: false,
            },
        });
    }

    openRemoveTourItineraryModal(context: TourItinerary) {
        this.modals$.next({
            ...this.modals$.value,
            removeTourItinerary: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveTourItineraryModal() {
        this.modals$.next({
            ...this.modals$.value,
            removeTourItinerary: {
                isOpen: false,
            },
        });
    }
}
