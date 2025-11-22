import { Component, inject } from '@angular/core';
import {
    ErrorDialogMessages,
    UIState as RootUIState,
    UIStatus,
} from '@app/core';
import { UserTrainingState, UIState } from '../../../state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-remove-training-modal',
    templateUrl: './remove-training-modal.component.html',
    styleUrls: ['./remove-training-modal.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveTrainingModalComponent {
    uiState = inject(UIState);
    rootUIState = inject(RootUIState);
    userTrainingState = inject(UserTrainingState);
    removeTrainingModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteTraining),
        distinctUntilChanged()
    );

    isOpen$ = this.removeTrainingModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeTrainingModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    close(): void {
        this.status$.next('idle');
        this.uiState.closeRemoveTrainingModal();
    }

    delete(userTrainingId?: number): void {
        if (!userTrainingId) {
            return;
        }
        this.status$.next('loading');
        this.userTrainingState
            .deleteUserTraining(userTrainingId)
            .then(() => {
                this.userTrainingState.refresh();
                this.close();
            })
            .catch(() => {
                this.rootUIState.openErrorDialog({
                    title: ErrorDialogMessages.userManagement
                        .trainingDeleteError.title,
                    description:
                        ErrorDialogMessages.userManagement.trainingDeleteError
                            .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .trainingDeleteError.buttons.close,
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
