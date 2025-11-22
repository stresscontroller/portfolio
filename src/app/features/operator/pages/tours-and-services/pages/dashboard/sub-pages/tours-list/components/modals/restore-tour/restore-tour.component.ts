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
    selector: 'app-restore-tour-modal',
    templateUrl: './restore-tour.component.html',
    styleUrls: ['./restore-tour.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        CustomDatePipe,
    ],
})
export class RestoreTourModalComponent {
    uiState = inject(UIState);
    tourListState = inject(TourListState);
    restoreTour$ = this.uiState.modals$.pipe(
        map((modals) => modals.restoreTour),
        distinctUntilChanged()
    );
    isOpen$ = this.restoreTour$.pipe(map((modal) => modal.isOpen));
    context$ = this.restoreTour$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    restore(config: TourDetails): void {
        if (!config) {
            return;
        }
        this.status$.next('loading');
        this.tourListState
            .deleteTour(config.tourId, true)
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
        this.uiState.closeRestoreTourModal();
    }
}
