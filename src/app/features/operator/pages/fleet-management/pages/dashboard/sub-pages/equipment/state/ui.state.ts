import { Injectable } from '@angular/core';
import { EquipmentListItem } from '@app/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewEquipment: {
            isOpen: boolean;
        };
        removeEquipment: {
            isOpen: boolean;
            context?: EquipmentListItem;
        };
        restoreEquipment: {
            isOpen: boolean;
            context?: EquipmentListItem;
        };
    }>({
        addNewEquipment: {
            isOpen: false,
        },
        removeEquipment: {
            isOpen: false,
        },
        restoreEquipment: {
            isOpen: false,
        },
    });

    openAddNewEquipmentModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewEquipment: {
                isOpen: true,
            },
        });
    }

    closeAddNewEquipmentModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewEquipment: {
                isOpen: false,
            },
        });
    }

    openRemoveEquipmentModal(context: EquipmentListItem) {
        this.modals$.next({
            ...this.modals$.value,
            removeEquipment: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveEquipmentModal() {
        this.modals$.next({
            ...this.modals$.value,
            removeEquipment: {
                isOpen: false,
            },
        });
    }

    openRestoreEquipmentModal(context: EquipmentListItem) {
        this.modals$.next({
            ...this.modals$.value,
            restoreEquipment: {
                isOpen: true,
                context,
            },
        });
    }

    closeRestoreEquipmentModal() {
        this.modals$.next({
            ...this.modals$.value,
            restoreEquipment: {
                isOpen: false,
            },
        });
    }
}
