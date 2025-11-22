import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TourIncludedItem } from '@app/core';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addTourIncluded: {
            isOpen: boolean;
            context?: string;
        };
        editTourIncluded: {
            isOpen: boolean;
            context?: TourIncludedItem;
        };
        deleteTourIncluded: {
            isOpen: boolean;
            context?: TourIncludedItem;
        };
    }>({
        addTourIncluded: {
            isOpen: false,
        },
        editTourIncluded: {
            isOpen: false,
        },
        deleteTourIncluded: {
            isOpen: false,
        },
    });

    openAddTourIncludedModal(context?: string) {
        this.modals$.next({
            ...this.modals$.value,
            addTourIncluded: {
                isOpen: true,
                context,
            },
        });
    }

    closeAddTourIncludedModal() {
        this.modals$.next({
            ...this.modals$.value,
            addTourIncluded: {
                isOpen: false,
            },
        });
    }

    openEditTourIncludedModal(context?: TourIncludedItem) {
        this.modals$.next({
            ...this.modals$.value,
            editTourIncluded: {
                isOpen: true,
                context,
            },
        });
    }
    closeEditTourIncludedModal() {
        this.modals$.next({
            ...this.modals$.value,
            editTourIncluded: {
                isOpen: false,
            },
        });
    }

    openRemoveTourIncludedModal(context?: TourIncludedItem) {
        this.modals$.next({
            ...this.modals$.value,
            deleteTourIncluded: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveTourIncludedModal() {
        this.modals$.next({
            ...this.modals$.value,
            deleteTourIncluded: {
                isOpen: false,
            },
        });
    }
}
