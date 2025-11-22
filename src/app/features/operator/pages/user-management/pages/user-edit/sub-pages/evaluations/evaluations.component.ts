import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

import {
    UserEvaluationsTableComponent,
    AddEvaluationModalComponent,
    EditEvaluationModalComponent,
    RemoveEvaluationModalComponent,
} from './components';
import { UIState, UserEvaluationsState } from './state';
import { Features } from '@app/core';
@Component({
    standalone: true,
    selector: 'app-evaluations',
    templateUrl: './evaluations.component.html',
    styleUrls: ['./evaluations.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        DropdownModule,
        LoaderEmbedComponent,
        UserEvaluationsTableComponent,
        AddEvaluationModalComponent,
        EditEvaluationModalComponent,
        RemoveEvaluationModalComponent,
        PermissionDirective,
    ],
    providers: [UIState, UserEvaluationsState],
})
export class EvaluationsComponent {
    features = Features;
    uiState = inject(UIState);
    userEvaluationsState = inject(UserEvaluationsState);

    status$ = this.userEvaluationsState.status$;
    evaluations$ = this.userEvaluationsState.evaluations$;

    ngOnInit(): void {
        this.userEvaluationsState.init();
    }

    refresh(): void {
        this.userEvaluationsState.refresh();
    }

    openAddEvaluationModal() {
        this.uiState.openAddEvaluationModal();
    }
}
