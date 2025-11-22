import { Injectable } from '@angular/core';
import { PayRateListItem } from '@app/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewPosition: {
            isOpen: boolean;
        };
        editPosition: {
            isOpen: boolean;
            context?: number;
        };
        removePosition: {
            isOpen: boolean;
            context?: number;
        };
        postJob: {
            isOpen: boolean;
            context?: number;
        };

        addNewPayRate: {
            isOpen: boolean;
        };
        editPayRate: {
            isOpen: boolean;
            context?: PayRateListItem;
        };
        removePayRate: {
            isOpen: boolean;
            context?: PayRateListItem;
        };
    }>({
        addNewPosition: {
            isOpen: false,
        },
        editPosition: {
            isOpen: false,
        },
        removePosition: {
            isOpen: false,
        },
        postJob: {
            isOpen: false,
        },

        addNewPayRate: {
            isOpen: false,
        },
        editPayRate: {
            isOpen: false,
        },
        removePayRate: {
            isOpen: false,
        },
    });

    openAddNewPositionModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewPosition: {
                isOpen: true,
            },
        });
    }

    closeAddNewPositionModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewPosition: {
                isOpen: false,
            },
        });
    }

    openEditPositionModal(context: number) {
        this.modals$.next({
            ...this.modals$.value,
            editPosition: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditPositionModal() {
        this.modals$.next({
            ...this.modals$.value,
            editPosition: {
                isOpen: false,
            },
        });
    }

    openRemovePositionModal(context: number) {
        this.modals$.next({
            ...this.modals$.value,
            removePosition: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemovePositionModal() {
        this.modals$.next({
            ...this.modals$.value,
            removePosition: {
                isOpen: false,
            },
        });
    }

    openPostJobModal(context: number) {
        this.modals$.next({
            ...this.modals$.value,
            postJob: {
                isOpen: true,
                context,
            },
        });
    }

    closePostJobModal() {
        this.modals$.next({
            ...this.modals$.value,
            postJob: {
                isOpen: false,
            },
        });
    }

    openAddNewPayRateModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewPayRate: {
                isOpen: true,
            },
        });
    }

    closeAddNewPayRateModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewPayRate: {
                isOpen: false,
            },
        });
    }

    openEditPayRateModal(context: PayRateListItem) {
        this.modals$.next({
            ...this.modals$.value,
            editPayRate: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditPayRateModal() {
        this.modals$.next({
            ...this.modals$.value,
            editPayRate: {
                isOpen: false,
            },
        });
    }

    openRemovePayRateModal(context: PayRateListItem) {
        this.modals$.next({
            ...this.modals$.value,
            removePayRate: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemovePayRateModal() {
        this.modals$.next({
            ...this.modals$.value,
            removePayRate: {
                isOpen: false,
            },
        });
    }
}
