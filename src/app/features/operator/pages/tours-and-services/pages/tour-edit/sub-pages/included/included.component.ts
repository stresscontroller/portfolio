import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { Features } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import {
    TourItemTableComponent,
    AddTourIncludedModalComponent,
    EditTourIncludedModalComponent,
    RemoveTourIncludedModalComponent,
} from './components';
import { UIState, TourIncludedState } from './state';
import { TourEditState } from '../../state';

@Component({
    standalone: true,
    selector: 'app-included',
    templateUrl: './included.component.html',
    styleUrls: ['./included.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        DropdownModule,
        LoaderEmbedComponent,
        TourItemTableComponent,
        AddTourIncludedModalComponent,
        EditTourIncludedModalComponent,
        RemoveTourIncludedModalComponent,
        PermissionDirective,
    ],
    providers: [UIState, TourIncludedState],
})
export class IncludedComponent {
    uiState = inject(UIState);
    tourIncludedState = inject(TourIncludedState);
    tourEditState = inject(TourEditState);
    features = Features;
    status$ = this.tourEditState.status$.pipe(
        map((status) => status.loadTourDetails)
    );
    included$ = this.tourIncludedState.whatsIncluded$;
    notIncluded$ = this.tourIncludedState.whatsNotIncluded$;

    ngOnInit(): void {
        this.tourIncludedState.init();
    }

    refresh(): void {
        this.tourIncludedState.refresh();
    }

    openAddTourIncludedModal(flag: string) {
        this.uiState.openAddTourIncludedModal(flag);
    }
}
