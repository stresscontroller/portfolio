import { Component, inject } from '@angular/core';
import { UserEvaluationsState, UIState } from '../../../state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import {
    UserEvaluationsListItem,
    UIState as RootUIState,
    ErrorDialogMessages,
    UIStatus,
} from '@app/core';

@Component({
    standalone: true,
    selector: 'app-remove-evaluation-modal',
    templateUrl: './remove-evaluation-modal.component.html',
    styleUrls: ['./remove-evaluation-modal.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveEvaluationModalComponent {
    uiState = inject(UIState);
    rootUIState = inject(RootUIState);
    userEvaluationsState = inject(UserEvaluationsState);
    removeFileModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteEvaluation),
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
        this.uiState.closeRemoveEvaluationModal();
    }

    delete(userEvaluation: UserEvaluationsListItem): void {
        this.status$.next('loading');
        this.userEvaluationsState
            .deleteUserEvaluation(userEvaluation)
            .then(() => {
                this.userEvaluationsState.refresh();
                this.close();
            })
            .catch(() => {
                this.rootUIState.openErrorDialog({
                    title: ErrorDialogMessages.userManagement
                        .evaluationDeleteError.title,
                    description:
                        ErrorDialogMessages.userManagement.evaluationDeleteError
                            .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .evaluationDeleteError.buttons.close,
                            onClick: () => {
                                this.close();
                            },
                        },
                    ],
                });
            });
    }
}
