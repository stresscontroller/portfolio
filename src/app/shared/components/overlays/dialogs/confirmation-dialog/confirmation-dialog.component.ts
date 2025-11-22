import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIState } from '@app/core';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
    standalone: true,
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
    imports: [CommonModule, ButtonModule, DialogModule],
})
export class ConfirmationDialogComponent {
    uiState = inject(UIState);

    confirmationDialog$ = this.uiState.dialogs$.pipe(
        map((dialogs) => dialogs.confirmation),
        distinctUntilChanged()
    );

    isOpen$ = this.confirmationDialog$.pipe(map((dialog) => dialog.isOpen));
    context$ = this.confirmationDialog$.pipe(
        filter((dialog) => dialog.isOpen),
        map((dialog) => dialog.context)
    );

    close(): void {
        this.uiState.closeConfirmationDialog();
    }
}
