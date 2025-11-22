import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
    CruiseLineListItem,
    CruiseLineTourListItem,
    CruiseShipListItem,
    CruiseShipScheduleListItem,
} from '@app/core';
@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addCruiseLine: {
            isOpen: boolean;
        };
        editCruiseLine: {
            isOpen: boolean;
            context?: CruiseLineListItem;
        };
        cruiseShipDetails: {
            isOpen: boolean;
            context?: CruiseShipListItem;
        };
        removeCruiseShip: {
            isOpen: boolean;
            context?: CruiseShipListItem;
        };
        editShipSchedule: {
            isOpen: boolean;
            context?: CruiseShipScheduleListItem;
        };
        tourServiceList: {
            isOpen: boolean;
            context?: CruiseLineListItem;
        };
        removeCruiseLine: {
            isOpen: boolean;
            context?: CruiseLineListItem;
        };
        restoreCruiseLine: {
            isOpen: boolean;
            context?: CruiseLineListItem;
        };
        editCruiseLineTour: {
            isOpen: boolean;
            context?: CruiseLineTourListItem;
        };
    }>({
        addCruiseLine: {
            isOpen: false,
        },
        editCruiseLine: {
            isOpen: false,
        },
        cruiseShipDetails: {
            isOpen: false,
        },
        removeCruiseShip: {
            isOpen: false,
        },
        editShipSchedule: {
            isOpen: false,
        },
        tourServiceList: {
            isOpen: false,
        },
        removeCruiseLine: {
            isOpen: false,
        },
        restoreCruiseLine: {
            isOpen: false,
        },
        editCruiseLineTour: {
            isOpen: false,
        },
    });

    openAddNewCruiseLineModal() {
        this.modals$.next({
            ...this.modals$.value,
            addCruiseLine: {
                isOpen: true,
            },
        });
    }

    closeAddNewCruiseLineModal() {
        this.modals$.next({
            ...this.modals$.value,
            addCruiseLine: {
                isOpen: false,
            },
        });
    }

    openEditCruiseLineModal(context: CruiseLineListItem) {
        this.modals$.next({
            ...this.modals$.value,
            tourServiceList: {
                isOpen: false,
            },
        });
        this.modals$.next({
            ...this.modals$.value,
            editCruiseLine: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditCruiseLineModal() {
        this.modals$.next({
            ...this.modals$.value,
            editCruiseLine: {
                isOpen: false,
            },
        });
    }

    openCruiseShipDetailsModal(context: CruiseShipListItem) {
        this.modals$.next({
            ...this.modals$.value,
            cruiseShipDetails: {
                isOpen: true,
                context,
            },
        });
    }

    closeCruiseShipDetailsModal() {
        this.modals$.next({
            ...this.modals$.value,
            cruiseShipDetails: {
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

    openTourServiceListModal(context: CruiseLineListItem) {
        this.modals$.next({
            ...this.modals$.value,
            tourServiceList: {
                isOpen: true,
                context,
            },
        });
    }

    closeTourServiceListModal() {
        this.modals$.next({
            ...this.modals$.value,
            tourServiceList: {
                isOpen: false,
            },
        });
    }

    openRemoveCruiseLineModal(context: CruiseLineListItem) {
        this.modals$.next({
            ...this.modals$.value,
            removeCruiseLine: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveCruiseLineModal() {
        this.modals$.next({
            ...this.modals$.value,
            removeCruiseLine: {
                isOpen: false,
            },
        });
    }

    openRestoreCruiseLineModal(context: CruiseLineListItem) {
        this.modals$.next({
            ...this.modals$.value,
            restoreCruiseLine: {
                isOpen: true,
                context,
            },
        });
    }

    closeRestoreCruiseLineModal() {
        this.modals$.next({
            ...this.modals$.value,
            restoreCruiseLine: {
                isOpen: false,
            },
        });
    }

    openEditCruiseLineTourModal(context: CruiseLineTourListItem) {
        this.modals$.next({
            ...this.modals$.value,
            editCruiseLineTour: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditCruiseLineTourModal() {
        this.modals$.next({
            ...this.modals$.value,
            editCruiseLineTour: {
                isOpen: false,
            },
        });
    }
}
