import { Injectable } from '@angular/core';
import { UserNotesListItem } from '@app/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        editNotes: {
            isOpen: boolean;
            context?: UserNotesListItem;
        };
        deleteNotes: {
            isOpen: boolean;
            context?: number;
        };
    }>({
        editNotes: {
            isOpen: false,
        },
        deleteNotes: {
            isOpen: false,
        },
    });

    openEditNotesModal(context: UserNotesListItem) {
        this.modals$.next({
            ...this.modals$.value,
            editNotes: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditNotesModal() {
        this.modals$.next({
            ...this.modals$.value,
            editNotes: {
                isOpen: false,
            },
        });
    }

    openDeleteNotesModal(context?: UserNotesListItem) {
        this.modals$.next({
            ...this.modals$.value,
            deleteNotes: {
                isOpen: true,
                context: context?.userNoteId,
            },
        });
    }

    closeDeleteNotesModal() {
        this.modals$.next({
            ...this.modals$.value,
            deleteNotes: {
                isOpen: false,
            },
        });
    }
}
