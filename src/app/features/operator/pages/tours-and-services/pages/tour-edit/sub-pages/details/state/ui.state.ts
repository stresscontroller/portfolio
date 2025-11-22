import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TourDetailsConfig } from '@app/core';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        saveTourDetails: {
            isOpen: boolean;
            context?: TourDetailsConfig;
        };
    }>({
        saveTourDetails: {
            isOpen: false,
        },
    });

    openSaveTourDetailsModal(context: TourDetailsConfig): void {
        this.modals$.next({
            ...this.modals$.value,
            saveTourDetails: {
                isOpen: true,
                context,
            },
        });
    }
    closeSaveTourDetailsModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            saveTourDetails: {
                isOpen: false,
            },
        });
    }
}
