import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIState } from '@app/core';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
    standalone: true,
    selector: 'app-error-dialog',
    templateUrl: './error-dialog.component.html',
    styleUrls: ['./error-dialog.component.scss'],
    imports: [CommonModule, ButtonModule, DialogModule],
})
export class ErrorDialogComponent {
    uiState = inject(UIState);

    errorDialog$ = this.uiState.dialogs$.pipe(
        map((dialogs) => dialogs.error),
        distinctUntilChanged()
    );

    isOpen$ = this.errorDialog$.pipe(map((dialog) => dialog.isOpen));
    context$ = this.errorDialog$.pipe(
        filter((dialog) => dialog.isOpen),
        map((dialog) => dialog.context)
    );

    close(): void {
        this.uiState.closeErrorDialog();
    }
}
