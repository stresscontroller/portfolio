import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { UserNotesTableComponent } from './components';
import { UIState, UserNotesState } from './state';
import { EditNotesModalComponent } from './components';
import { DeleteNotesModalComponent } from './components';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { Features } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-notes',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss'],
    imports: [
        CommonModule,
        InputTextareaModule,
        ReactiveFormsModule,
        ButtonModule,
        UserNotesTableComponent,
        EditNotesModalComponent,
        DeleteNotesModalComponent,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
    providers: [UIState, UserNotesState],
})
export class NotesComponent {
    features = Features;
    userNotesState = inject(UserNotesState);
    notesForm = new FormGroup({
        notes: new FormControl('', {
            validators: [Validators.required],
        }),
    });
    notes$ = this.userNotesState.notes$;
    status$ = this.userNotesState.status$;

    ngOnInit(): void {
        this.userNotesState.init();
    }

    refresh(): void {
        this.userNotesState.refresh();
    }

    clear(): void {
        this.notesForm.reset();
    }

    saveNotes(): void {
        if (this.notesForm.valid && this.notesForm.value.notes) {
            this.userNotesState
                .saveUserNotes(this.notesForm.value.notes)
                .then(() => {
                    this.clear();
                })
                .catch(() => {
                    // we need to do some error popup
                });
        } else {
            // no need to do anything here, button should be disabled
            // but just in case, we'll add a safeguard anyway
        }
    }
}
