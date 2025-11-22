import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TourDetails, UIStatus } from '@app/core';
import { CustomDatePipe } from '@app/shared';
import { TourListState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-remove-tour-modal',
    templateUrl: './remove-tour.component.html',
    styleUrls: ['./remove-tour.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        CustomDatePipe,
    ],
})
export class RemoveTourModalComponent {
    uiState = inject(UIState);
    tourListState = inject(TourListState);
    deleteTour$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteTour),
        distinctUntilChanged()
    );
    isOpen$ = this.deleteTour$.pipe(map((modal) => modal.isOpen));
    context$ = this.deleteTour$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    delete(config: TourDetails): void {
        if (!config) {
            return;
        }
        this.status$.next('loading');
        this.tourListState
            .deleteTour(config.tourId, false)
            .then(() => {
                this.tourListState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeDeleteTourModal();
    }
}
