import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIState } from '@app/core';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
    standalone: true,
    selector: 'app-success-dialog',
    templateUrl: './success-dialog.component.html',
    styleUrls: ['./success-dialog.component.scss'],
    imports: [CommonModule, ButtonModule, DialogModule],
})
export class SuccessDialogComponent {
    uiState = inject(UIState);

    successDialog$ = this.uiState.dialogs$.pipe(
        map((dialogs) => dialogs.success),
        distinctUntilChanged()
    );

    isOpen$ = this.successDialog$.pipe(map((dialog) => dialog.isOpen));
    context$ = this.successDialog$.pipe(
        filter((dialog) => dialog.isOpen),
        map((dialog) => dialog.context)
    );

    close(): void {
        this.uiState.closeSuccessDialog();
    }
}
