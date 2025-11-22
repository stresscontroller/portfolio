import { Component, inject } from '@angular/core';
import { UserTrainingState, UIState } from '../../../state';
import { map, distinctUntilChanged, filter } from 'rxjs';
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
    close() {
        this.uiState.closeRemoveTrainingModal();
    }
    delete(userTrainingId?: number) {
        if (userTrainingId) {
            this.userTrainingState
                .deleteUserTraining(userTrainingId)
                .then(() => {
                    this.close();
                });
        }
    }
}
