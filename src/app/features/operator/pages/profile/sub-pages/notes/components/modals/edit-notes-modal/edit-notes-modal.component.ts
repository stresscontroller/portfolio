import { Component, inject } from '@angular/core';
import { InputTextareaModule } from 'primeng/inputtextarea';

import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { UIState, UserNotesState } from '../../../state';
import { map, distinctUntilChanged, filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

import { BehaviorSubject } from 'rxjs';
import { UIStatus } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-edit-notes-modal',
    templateUrl: './edit-notes-modal.component.html',
    styleUrls: ['./edit-notes-modal.component.scss'],
    imports: [
        DialogModule,
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextareaModule,
    ],
})
export class EditNotesModalComponent {
    uiState = inject(UIState);
    userNotesState = inject(UserNotesState);
    editNotesForm = new FormGroup({
        note: new FormControl('', {
            validators: [Validators.required, Validators.maxLength(1000)],
        }),
        userNoteId: new FormControl<number | null>(null),
    });

    editUserNotes$ = this.uiState.modals$.pipe(
        map((modals) => modals.editNotes),
        distinctUntilChanged()
    );
    isOpen$ = this.editUserNotes$.pipe(map((modal) => modal.isOpen));
    context$ = this.editUserNotes$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = this.userNotesState.status$;
    notes$ = this.userNotesState.notes$;
    editNotesStatus$ = new BehaviorSubject<UIStatus>('idle');

    ngOnInit(): void {
        this.context$.pipe().subscribe((res) => {
            this.editNotesForm.patchValue({
                userNoteId: res?.userNoteId,
                note: res?.notes,
            });
        });
    }

    close() {
        this.uiState.closeEditNotesModal();
    }

    clear(): void {
        this.editNotesForm.reset();
    }

    saveUserNote(): void {
        const formValues = this.editNotesForm.getRawValue();
        this.editNotesStatus$.next('loading');
        this.userNotesState
            .editUserNote({
                userNoteId: formValues.userNoteId ?? 0,
                notes: formValues.note ?? '',
                userId: '',
                companyId: '',
                createdBy: '',
            })
            .then(() => {
                this.editNotesStatus$.next('success');
                this.clear();
                this.close();
            })
            .catch(() => {
                this.editNotesStatus$.next('error');
            });
    }
}
