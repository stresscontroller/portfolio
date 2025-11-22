import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EquipmentTypeListItem } from '@app/core';
@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewEquipmentType: {
            isOpen: boolean;
        };
        editEquipmentType: {
            isOpen: boolean;
            context?: EquipmentTypeListItem;
        };
        removeEquipmentType: {
            isOpen: boolean;
            context?: EquipmentTypeListItem;
        };
        restoreEquipmentType: {
            isOpen: boolean;
            context?: EquipmentTypeListItem;
        };
    }>({
        addNewEquipmentType: {
            isOpen: false,
        },
        editEquipmentType: {
            isOpen: false,
        },
        removeEquipmentType: {
            isOpen: false,
        },
        restoreEquipmentType: {
            isOpen: false,
        },
    });

    openAddNewEquipmentTypeModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewEquipmentType: {
                isOpen: true,
            },
        });
    }

    closeAddNewEquipmentTypeModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewEquipmentType: {
                isOpen: false,
            },
        });
    }

    openEditEquipmentTypeModal(context: EquipmentTypeListItem) {
        this.modals$.next({
            ...this.modals$.value,
            editEquipmentType: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditEquipmentTypeModal() {
        this.modals$.next({
            ...this.modals$.value,
            editEquipmentType: {
                isOpen: false,
            },
        });
    }

    openRemoveEquipmentTypeModal(context: EquipmentTypeListItem) {
        this.modals$.next({
            ...this.modals$.value,
            removeEquipmentType: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveEquipmentTypeModal() {
        this.modals$.next({
            ...this.modals$.value,
            removeEquipmentType: {
                isOpen: false,
            },
        });
    }

    openRestoreEquipmentTypeModal(context: EquipmentTypeListItem) {
        this.modals$.next({
            ...this.modals$.value,
            restoreEquipmentType: {
                isOpen: true,
                context,
            },
        });
    }

    closeRestoreEquipmentTypeModal() {
        this.modals$.next({
            ...this.modals$.value,
            restoreEquipmentType: {
                isOpen: false,
            },
        });
    }
}
