import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PermissionConfig, PermissionDirective } from '@app/shared';
import { ManageService } from '../../manage.service';

@Component({
    standalone: true,
    selector: 'app-notes',
    templateUrl: './notes.component.html',
    styleUrls: ['./notes.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        InputTextareaModule,
        PermissionDirective,
    ],
})
export class NotesComponent {
    @Input() updatePermission?: PermissionConfig;
    manageService = inject(ManageService);

    bookingNotes$ = this.manageService.bookingNotes$.pipe(
        map((bookingNotes) => bookingNotes || '')
    );

    onModelChange(notes: string): void {
        this.manageService.updateBookingNotes(notes);
    }
}
