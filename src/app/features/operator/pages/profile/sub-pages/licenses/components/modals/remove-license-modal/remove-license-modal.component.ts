import { Component, inject } from '@angular/core';
import { SpecialLicensesState, UIState } from '../../../state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import {
    UIStatus,
    UserQualificationListItem,
    UIState as RootUIState,
    ErrorDialogMessages,
} from '@app/core';

@Component({
    standalone: true,
    selector: 'app-remove-license-modal',
    templateUrl: './remove-license-modal.component.html',
    styleUrls: ['./remove-license-modal.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveLicenseModalComponent {
    uiState = inject(UIState);
    specialLicensesState = inject(SpecialLicensesState);
    rootUIState = inject(RootUIState);
    removeFileModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteLicense),
        distinctUntilChanged()
    );

    isOpen$ = this.removeFileModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeFileModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    close(): void {
        this.status$.next('idle');
        this.uiState.closeRemoveLicenseModal();
    }

    delete(context: UserQualificationListItem): void {
        this.status$.next('loading');
        this.specialLicensesState
            .deleteSpecialLicense(context)
            .then(() => {
                this.specialLicensesState.refresh();
                this.close();
            })
            .catch(() => {
                this.rootUIState.openErrorDialog({
                    title: ErrorDialogMessages.userManagement.licenseDeleteError
                        .title,
                    description:
                        ErrorDialogMessages.userManagement.licenseDeleteError
                            .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .licenseDeleteError.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                this.close();
                            },
                        },
                    ],
                });
            });
    }
}
