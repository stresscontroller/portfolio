import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CruiseShipListItem, CruiseShipScheduleListItem } from '@app/core';
@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        editCruiseShip: {
            isOpen: boolean;
            context?: CruiseShipListItem;
        };
        removeCruiseShip: {
            isOpen: boolean;
            context?: CruiseShipListItem;
        };
        restoreCruiseShip: {
            isOpen: boolean;
            context?: CruiseShipListItem;
        };
        addNewShipSchedule: {
            isOpen: boolean;
        };
        editShipSchedule: {
            isOpen: boolean;
            context?: CruiseShipScheduleListItem;
        };
        removeShipSchedule: {
            isOpen: boolean;
            context?: CruiseShipScheduleListItem;
        };
    }>({
        editCruiseShip: {
            isOpen: false,
        },
        removeCruiseShip: {
            isOpen: false,
        },
        restoreCruiseShip: {
            isOpen: false,
        },
        addNewShipSchedule: {
            isOpen: false,
        },
        editShipSchedule: {
            isOpen: false,
        },
        removeShipSchedule: {
            isOpen: false,
        },
    });

    openEditCruiseShipModal(context: CruiseShipListItem) {
        this.modals$.next({
            ...this.modals$.value,
            editCruiseShip: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditCruiseShipModal() {
        this.modals$.next({
            ...this.modals$.value,
            editCruiseShip: {
                isOpen: false,
            },
        });
    }

    openRemoveCruiseShipModal(context: CruiseShipListItem) {
        this.modals$.next({
            ...this.modals$.value,
            removeCruiseShip: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveCruiseShipModal() {
        this.modals$.next({
            ...this.modals$.value,
            removeCruiseShip: {
                isOpen: false,
            },
        });
    }

    openRestoreCruiseShipModal(context: CruiseShipListItem) {
        this.modals$.next({
            ...this.modals$.value,
            restoreCruiseShip: {
                isOpen: true,
                context,
            },
        });
    }

    closeRestoreCruiseShipModal() {
        this.modals$.next({
            ...this.modals$.value,
            restoreCruiseShip: {
                isOpen: false,
            },
        });
    }

    openAddNewShipScheduleModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewShipSchedule: {
                isOpen: true,
            },
        });
    }

    closeAddNewShipScheduleModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewShipSchedule: {
                isOpen: false,
            },
        });
    }

    openEditShipScheduleModal(context: CruiseShipScheduleListItem) {
        this.modals$.next({
            ...this.modals$.value,
            editShipSchedule: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditShipScheduleModal() {
        this.modals$.next({
            ...this.modals$.value,
            editShipSchedule: {
                isOpen: false,
            },
        });
    }

    openRemoveShipScheduleModal(context: CruiseShipScheduleListItem) {
        this.modals$.next({
            ...this.modals$.value,
            removeShipSchedule: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveShipScheduleModal() {
        this.modals$.next({
            ...this.modals$.value,
            removeShipSchedule: {
                isOpen: false,
            },
        });
    }
}
