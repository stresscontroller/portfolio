import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewUsage: {
            isOpen: boolean;
        };
    }>({
        addNewUsage: {
            isOpen: false,
        },
    });

    openAddNewUsageModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewUsage: {
                isOpen: true,
            },
        });
    }

    closeAddNewUsageModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewUsage: {
                isOpen: false,
            },
        });
    }
}
