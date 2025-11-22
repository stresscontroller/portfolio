import { Injectable } from '@angular/core';
import {
    FileHeaderTextMapsItem,
    PortMapsItem,
    ShipCompanyShipMapsItem,
    TourMapsItem,
} from '@app/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewReport: {
            isOpen: boolean;
        };
        editReport: {
            isOpen: boolean;
            context?: FileHeaderTextMapsItem;
        };
        deleteReport: {
            isOpen: boolean;
            context?: number;
        };
        addNewShip: {
            isOpen: boolean;
        };
        editShip: {
            isOpen: boolean;
            context?: ShipCompanyShipMapsItem;
        };
        deleteShip: {
            isOpen: boolean;
            context?: ShipCompanyShipMapsItem;
        };
        addNewPort: {
            isOpen: boolean;
        };
        editPort: {
            isOpen: boolean;
            context?: PortMapsItem;
        };
        deletePort: {
            isOpen: boolean;
            context?: PortMapsItem;
        };
        addNewTour: {
            isOpen: boolean;
        };
        editTour: {
            isOpen: boolean;
            context?: TourMapsItem;
        };
        deleteTour: {
            isOpen: boolean;
            context?: TourMapsItem;
        };
        uploadFile: {
            isOpen: boolean;
        };
    }>({
        addNewReport: {
            isOpen: false,
        },
        editReport: {
            isOpen: false,
        },
        deleteReport: {
            isOpen: false,
        },
        addNewShip: {
            isOpen: false,
        },
        editShip: {
            isOpen: false,
        },
        deleteShip: {
            isOpen: false,
        },
        addNewPort: {
            isOpen: false,
        },
        editPort: {
            isOpen: false,
        },
        deletePort: {
            isOpen: false,
        },
        addNewTour: {
            isOpen: false,
        },
        editTour: {
            isOpen: false,
        },
        deleteTour: {
            isOpen: false,
        },
        uploadFile: {
            isOpen: false,
        },
    });

    openAddNewReportModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewReport: {
                isOpen: true,
            },
        });
    }

    closeAddNewReportModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewReport: {
                isOpen: false,
            },
        });
    }

    openRemoveFileReportModal(context: number): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteReport: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveFileReportModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteReport: {
                isOpen: false,
            },
        });
    }

    openEditReportModal(context: FileHeaderTextMapsItem): void {
        this.modals$.next({
            ...this.modals$.value,
            editReport: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditReportModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            editReport: {
                isOpen: false,
            },
        });
    }

    openAddNewShipModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewShip: {
                isOpen: true,
            },
        });
    }

    closeAddNewShipModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewShip: {
                isOpen: false,
            },
        });
    }

    openRemoveShipModal(context: ShipCompanyShipMapsItem): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteShip: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveShipModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteShip: {
                isOpen: false,
            },
        });
    }

    openEditShipModal(context: ShipCompanyShipMapsItem): void {
        this.modals$.next({
            ...this.modals$.value,
            editShip: {
                isOpen: true,
                context,
            },
        });
    }
    closeEditShipModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            editShip: {
                isOpen: false,
            },
        });
    }

    openAddNewPortModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewPort: {
                isOpen: true,
            },
        });
    }

    closeAddNewPortModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewPort: {
                isOpen: false,
            },
        });
    }

    openRemovePortModal(context: PortMapsItem): void {
        this.modals$.next({
            ...this.modals$.value,
            deletePort: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemovePortModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            deletePort: {
                isOpen: false,
            },
        });
    }

    openEditPortModal(context: PortMapsItem): void {
        this.modals$.next({
            ...this.modals$.value,
            editPort: {
                isOpen: true,
                context,
            },
        });
    }
    closeEditPortModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            editPort: {
                isOpen: false,
            },
        });
    }

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

    openRemoveTourModal(context: TourMapsItem): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteTour: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveTourModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteTour: {
                isOpen: false,
            },
        });
    }

    openEditTourModal(context: TourMapsItem): void {
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
    openUploadFileModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            uploadFile: {
                isOpen: true,
            },
        });
    }

    closeUploadFileModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            uploadFile: {
                isOpen: false,
            },
        });
    }
}
