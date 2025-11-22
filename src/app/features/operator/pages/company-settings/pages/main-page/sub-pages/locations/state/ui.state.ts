import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewLocation: {
            isOpen: boolean;
        };
    }>({
        addNewLocation: {
            isOpen: false,
        },
    });

    openAddNewLocationModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewLocation: {
                isOpen: true,
            },
        });
    }

    closeAddNewLocationModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewLocation: {
                isOpen: false,
            },
        });
    }
}
