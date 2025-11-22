import { Component, inject } from '@angular/core';
import { TourVideoState, UIState } from '../../../state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { UIStatus } from '@app/core';
@Component({
    standalone: true,
    selector: 'app-remove-video-modal',
    templateUrl: './remove-video-modal.component.html',
    styleUrls: ['./remove-video-modal.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveTourVideoModalComponent {
    uiState = inject(UIState);
    tourVideoState = inject(TourVideoState);
    removeVideoModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteVideo),
        distinctUntilChanged()
    );

    isOpen$ = this.removeVideoModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeVideoModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    tourDetails$ = this.tourVideoState.tourDetails$;

    close(): void {
        this.status$.next('idle');
        this.uiState.closeRemoveTourVideoModal();
    }

    delete(id: number): void {
        this.status$.next('idle');
        this.tourVideoState
            .deleteTourVideo(id)
            .then(() => {
                this.tourVideoState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
