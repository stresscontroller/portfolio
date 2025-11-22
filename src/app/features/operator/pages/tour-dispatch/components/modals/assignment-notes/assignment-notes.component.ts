import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, distinctUntilChanged, filter, map, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AppAssignment, Features } from '@app/core';
import { AssignmentsState, UIState } from '../../../state';
import { ModalTourDetailsComponent } from '../common';
import { PermissionDirective } from '@app/shared';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
    standalone: true,
    selector: 'app-assignment-notes-modal',
    templateUrl: './assignment-notes.component.html',
    styleUrls: ['./assignment-notes.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        InputTextareaModule,
        ButtonModule,
        DialogModule,
        ModalTourDetailsComponent,
        PermissionDirective,
    ],
})
export class AssignmentNotesModalComponent {
    assignmentsState = inject(AssignmentsState);
    uiState = inject(UIState);
    features = Features;

    assignmentNotesModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.assignmentNotes),
        distinctUntilChanged()
    );

    isOpen$ = this.assignmentNotesModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.assignmentNotesModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    status$ = this.assignmentsState.status$.pipe(
        map((status) => status.updateNotes)
    );

    notes = '';

    private isDestroyed$ = new Subject<void>();
    ngAfterViewInit(): void {
        this.context$
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((context) => {
                this.notes = this.replaceQuotes(
                    context?.assignment?.specialNotes ?? ''
                );
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    save(assignment?: AppAssignment): void {
        if (!assignment) {
            return;
        }
        this.assignmentsState
            .updateSpecialNotes({
                tourInventoryId: assignment.tourInventoryId,
                specialNotes: this.notes || '',
                createdBy: '',
            })
            .then(() => {
                this.assignmentsState.refresh(true);
                this.close();
            })
            .catch(() => {
                // do nothing
            });
    }

    close(): void {
        this.notes = '';
        this.uiState.closeAssignmentNotesModal();
    }

    replaceQuotes(input: string): string {
        return input.replace(/&quot;/g, '"');
    }
}
