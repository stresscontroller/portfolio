import { Component, Input, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { UIState } from '../../state';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Features, UserEvaluationsListItem } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-user-evaluations-table',
    templateUrl: './user-evaluations-table.component.html',
    styleUrls: ['./user-evaluations-table.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class UserEvaluationsTableComponent {
    features = Features;
    uiState = inject(UIState);
    @Input() userEvaluations: UserEvaluationsListItem[] = [];

    openEditEvaluationModal(item: UserEvaluationsListItem) {
        this.uiState.openEditEvaluationModal(item);
    }

    closeEditEvaluationModal() {
        this.uiState.closeRemoveEvaluationModal();
    }

    openRemoveEvaluationModal(item: UserEvaluationsListItem) {
        this.uiState.openRemoveEvaluationModal(item);
    }

    closeRemoveEvaluationModal() {
        this.uiState.closeRemoveEvaluationModal();
    }
}
