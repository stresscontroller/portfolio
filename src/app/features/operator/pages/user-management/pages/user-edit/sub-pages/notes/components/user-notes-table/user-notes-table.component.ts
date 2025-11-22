import { Component, Input, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { UIState } from '../../state';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Features, UserNotesListItem } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-user-notes-table',
    templateUrl: './user-notes-table.component.html',
    styleUrls: ['./user-notes-table.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class UserNotesTableComponent {
    features = Features;
    uiState = inject(UIState);
    @Input() userNotes: UserNotesListItem[] = [];

    openEditNotesModal(context: UserNotesListItem) {
        this.uiState.openEditNotesModal(context);
    }
    openDeleteNotesModal(context: UserNotesListItem) {
        this.uiState.openDeleteNotesModal(context);
    }
}
