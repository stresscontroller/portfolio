import { Component, inject } from '@angular/core';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { UIState } from '../../../state';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { UserNotesState } from '../../../state';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-delete-notes-modal',
    templateUrl: './delete-notes-modal.component.html',
    styleUrls: ['./delete-notes-modal.component.scss'],
    imports: [DialogModule, DividerModule, CommonModule, ButtonModule],
})
export class DeleteNotesModalComponent {
    uiState = inject(UIState);
    userNotesState = inject(UserNotesState);
    deleteNotes$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteNotes),
        distinctUntilChanged()
    );

    isOpen$ = this.deleteNotes$.pipe(map((modal) => modal.isOpen));
    context$ = this.deleteNotes$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    deleteNoteStatus$ = new BehaviorSubject<
        'idle' | 'loading' | 'success' | 'error'
    >('idle');
    close() {
        this.uiState.closeDeleteNotesModal();
    }

    deleteNote(userNoteId: number) {
        this.deleteNoteStatus$.next('loading');
        this.userNotesState
            .deleteUserNotes(userNoteId)
            .then(() => {
                this.deleteNoteStatus$.next('success');
            })
            .catch(() => {
                this.deleteNoteStatus$.next('error');
            });
    }
}
