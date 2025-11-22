import { Injectable } from '@angular/core';
import { UserEvaluationsListItem } from '@app/core';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addEvaluation: {
            isOpen: boolean;
        };
        editEvaluation: {
            isOpen: boolean;
            context?: UserEvaluationsListItem;
        };
        deleteEvaluation: {
            isOpen: boolean;
            context?: UserEvaluationsListItem;
        };
    }>({
        addEvaluation: {
            isOpen: false,
        },
        editEvaluation: {
            isOpen: false,
        },
        deleteEvaluation: {
            isOpen: false,
        },
    });

    openAddEvaluationModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addEvaluation: {
                isOpen: true,
            },
        });
    }

    closeAddEvaluationModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addEvaluation: {
                isOpen: false,
            },
        });
    }

    openEditEvaluationModal(context: UserEvaluationsListItem): void {
        this.modals$.next({
            ...this.modals$.value,
            editEvaluation: {
                isOpen: true,
                context,
            },
        });
    }
    closeEditEvaluationModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            editEvaluation: {
                isOpen: false,
            },
        });
    }

    openRemoveEvaluationModal(context: UserEvaluationsListItem): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteEvaluation: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveEvaluationModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteEvaluation: {
                isOpen: false,
            },
        });
    }
}
