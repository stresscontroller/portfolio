import { Component, Input, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { UIState } from '../../state';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Features, UserTrainingDataItem } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-user-training-table',
    templateUrl: './user-training-table.component.html',
    styleUrls: ['./user-training-table.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class UserTrainingTableComponent {
    features = Features;
    uiState = inject(UIState);
    @Input() userTraining: UserTrainingDataItem[] = [];

    openEditTrainingModal(item: UserTrainingDataItem) {
        this.uiState.openEditTrainingModal(item);
    }

    closeEditTrainingModal() {
        this.uiState.closeRemoveTrainingModal();
    }

    openRemoveTrainingModal(item: UserTrainingDataItem) {
        this.uiState.openRemoveTrainingModal(item.userTrainingId);
    }

    closeRemoveTrainingModal() {
        this.uiState.closeRemoveTrainingModal();
    }
}
