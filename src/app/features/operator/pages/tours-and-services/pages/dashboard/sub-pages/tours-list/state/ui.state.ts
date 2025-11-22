import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TourDetails } from '@app/core';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewTour: {
            isOpen: boolean;
        };
        editTour: {
            isOpen: boolean;
            context?: TourDetails;
        };
        deleteTour: {
            isOpen: boolean;
            context?: TourDetails;
        };
        restoreTour: {
            isOpen: boolean;
            context?: TourDetails;
        };
    }>({
        addNewTour: {
            isOpen: false,
        },
        editTour: {
            isOpen: false,
        },
        deleteTour: {
            isOpen: false,
        },
        restoreTour: {
            isOpen: false,
        },
    });

    openAddNewTourModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewTour: {
                isOpen: true,
            },
        });
    }
    closeAddNewTourModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewTour: {
                isOpen: false,
            },
        });
    }

    openEditTourModal(context: TourDetails): void {
        this.modals$.next({
            ...this.modals$.value,
            editTour: {
                isOpen: true,
                context,
            },
        });
    }
    closeEditTourModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            editTour: {
                isOpen: false,
            },
        });
    }

    openDeleteTourModal(context: TourDetails): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteTour: {
                isOpen: true,
                context,
            },
        });
    }
    closeDeleteTourModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteTour: {
                isOpen: false,
            },
        });
    }

    openRestoreTourModal(context: TourDetails): void {
        this.modals$.next({
            ...this.modals$.value,
            restoreTour: {
                isOpen: true,
                context,
            },
        });
    }
    closeRestoreTourModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            restoreTour: {
                isOpen: false,
            },
        });
    }
}
