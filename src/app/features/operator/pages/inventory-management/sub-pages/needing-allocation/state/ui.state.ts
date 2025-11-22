import { Injectable } from '@angular/core';
import { InventoryManagementItem } from '@app/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UIState {
    modals$ = new BehaviorSubject<{
        setReminder: {
            isOpen: boolean;
            context?: InventoryManagementItem;
        };
    }>({
        setReminder: {
            isOpen: false,
        },
    });

    openSetReminderModal(context: InventoryManagementItem): void {
        if (this.modals$.getValue().setReminder.isOpen === false) {
            this.modals$.next({
                ...this.modals$.getValue(),
                setReminder: {
                    isOpen: true,
                    context: context,
                },
            });
        }
    }

    closeSetReminderModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            setReminder: {
                isOpen: false,
            },
        });
    }
}
