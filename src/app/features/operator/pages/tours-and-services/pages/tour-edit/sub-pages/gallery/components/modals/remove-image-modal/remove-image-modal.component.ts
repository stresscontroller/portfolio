import { Component, inject } from '@angular/core';
import { TourGalleryState, UIState } from '../../../state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { UIStatus } from '@app/core';
@Component({
    standalone: true,
    selector: 'app-remove-image-modal',
    templateUrl: './remove-image-modal.component.html',
    styleUrls: ['./remove-image-modal.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveImageModalComponent {
    uiState = inject(UIState);
    tourGalleryState = inject(TourGalleryState);
    deleteImageModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteImage),
        distinctUntilChanged()
    );

    isOpen$ = this.deleteImageModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.deleteImageModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    close() {
        this.status$.next('idle');
        this.uiState.closeDeleteItemModal();
    }

    delete(id: number) {
        this.status$.next('loading');
        this.tourGalleryState
            .deleteImage(id)
            .then(() => {
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
