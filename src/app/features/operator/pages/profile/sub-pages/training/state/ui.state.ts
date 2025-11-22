import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserTrainingDataItem } from '@app/core';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addTraining: {
            isOpen: boolean;
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

    openAddTrainingModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addTraining: {
                isOpen: true,
            },
        });
    }

    closeAddTrainingModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addTraining: {
                isOpen: false,
            },
        });
    }

    openEditTrainingModal(context: UserTrainingDataItem): void {
        this.modals$.next({
            ...this.modals$.value,
            editTraining: {
                isOpen: true,
                context,
            },
        });
    }
    closeEditTrainingModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            editTraining: {
                isOpen: false,
            },
        });
    }

    openRemoveTrainingModal(context: number): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteTraining: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveTrainingModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteTraining: {
                isOpen: false,
            },
        });
    }
}
