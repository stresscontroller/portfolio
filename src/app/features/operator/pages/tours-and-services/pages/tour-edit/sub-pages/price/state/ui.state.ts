import { Injectable } from '@angular/core';
import { TourPriceDetails } from '@app/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewTourPrice: {
            isOpen: boolean;
            context?: { tourId: number };
        };
        editTourPrice: {
            isOpen: boolean;
            context?: TourPriceDetails;
        };
        removeTourPrice: {
            isOpen: boolean;
            context?: TourPriceDetails;
        };
    }>({
        addNewTourPrice: {
            isOpen: false,
        },
        editTourPrice: {
            isOpen: false,
        },
        removeTourPrice: {
            isOpen: false,
        },
    });

    openAddNewTourPriceModal(tourId: number): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewTourPrice: {
                isOpen: true,
                context: { tourId },
            },
        });
    }

    closeAddNewTourPriceModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewTourPrice: {
                isOpen: false,
            },
        });
    }

    openEditTourPriceModal(context: TourPriceDetails): void {
        this.modals$.next({
            ...this.modals$.value,
            editTourPrice: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditTourPriceModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            editTourPrice: {
                isOpen: false,
            },
        });
    }

    openRemoveTourPriceModal(context: TourPriceDetails): void {
        this.modals$.next({
            ...this.modals$.value,
            removeTourPrice: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveTourPriceModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            removeTourPrice: {
                isOpen: false,
            },
        });
    }
}
