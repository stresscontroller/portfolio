import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserTrainingDataItem } from '@app/core';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addTraining: {
            isOpen: boolean;
            context?: UserTrainingDataItem;
        };
        editTraining: {
            isOpen: boolean;
            context?: UserTrainingDataItem;
        };
        deleteTraining: {
            isOpen: boolean;
            context?: number;
        };
    }>({
        addTraining: {
            isOpen: false,
        },
        editTraining: {
            isOpen: false,
        },
        deleteTraining: {
            isOpen: false,
        },
    });

    openAddTrainingModal(context?: UserTrainingDataItem) {
        this.modals$.next({
            ...this.modals$.value,
            addTraining: {
                isOpen: true,
                context,
            },
        });
    }

    closeAddTrainingModal() {
        this.modals$.next({
            ...this.modals$.value,
            addTraining: {
                isOpen: false,
            },
        });
    }

    openEditTrainingModal(context?: UserTrainingDataItem) {
        this.modals$.next({
            ...this.modals$.value,
            editTraining: {
                isOpen: true,
                context,
            },
        });
    }
    closeEditTrainingModal() {
        this.modals$.next({
            ...this.modals$.value,
            editTraining: {
                isOpen: false,
            },
        });
    }

    openRemoveTrainingModal(context?: number) {
        this.modals$.next({
            ...this.modals$.value,
            deleteTraining: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveTrainingModal() {
        this.modals$.next({
            ...this.modals$.value,
            deleteTraining: {
                isOpen: false,
            },
        });
    }
}
