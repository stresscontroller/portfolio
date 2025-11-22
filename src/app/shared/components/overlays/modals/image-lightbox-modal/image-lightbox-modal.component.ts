import { Component, inject } from '@angular/core';
import { map, distinctUntilChanged, filter } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { UIState } from '@app/core';
@Component({
    standalone: true,
    selector: 'app-image-lightbox-modal',
    templateUrl: './image-lightbox-modal.component.html',
    styleUrls: ['./image-lightbox-modal.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class ImageLightboxModalComponent {
    uiState = inject(UIState);
    lightboxModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.lightbox),
        distinctUntilChanged()
    );

    isOpen$ = this.lightboxModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.lightboxModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    close() {
        this.uiState.closeLightbox();
    }
}
