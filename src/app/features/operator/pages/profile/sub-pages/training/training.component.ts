import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { map } from 'rxjs';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import {
    UserTrainingTableComponent,
    AddTrainingModalComponent,
    EditTrainingModalComponent,
    RemoveTrainingModalComponent,
} from './components';
import { UIState, UserTrainingState } from './state';
import { Features } from '@app/core';
@Component({
    standalone: true,
    selector: 'app-evaluations',
    templateUrl: './training.component.html',
    styleUrls: ['./training.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        DropdownModule,
        LoaderEmbedComponent,
        UserTrainingTableComponent,
        AddTrainingModalComponent,
        EditTrainingModalComponent,
        RemoveTrainingModalComponent,
        PermissionDirective,
    ],
    providers: [UIState, UserTrainingState],
})
export class TrainingComponent {
    features = Features;
    uiState = inject(UIState);
    userTrainingState = inject(UserTrainingState);

    status$ = this.userTrainingState.status$.pipe(
        map((status) => status.loadTrainingData)
    );
    trainingData$ = this.userTrainingState.userTrainingData$;

    ngOnInit(): void {
        this.userTrainingState.init();
    }

    refresh(): void {
        this.userTrainingState.refresh();
    }

    openAddTrainingModal() {
        this.uiState.openAddTrainingModal();
    }
}
