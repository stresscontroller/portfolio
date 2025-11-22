import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { UIStatus } from '@app/core';
import { TourGalleryState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-upload-image-modal',
    templateUrl: './upload-image-modal.component.html',
    styleUrls: ['./upload-image-modal.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        CheckboxModule,
        DialogModule,
        DividerModule,
        ButtonModule,
    ],
})
export class UploadImageModalComponent {
    uiState = inject(UIState);
    tourGalleryState = inject(TourGalleryState);
    uploadImageModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.uploadImage),
        distinctUntilChanged()
    );

    isOpen$ = this.uploadImageModal$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    selectedFile: (File & { imgSrc?: string }) | undefined = undefined;
    isShoppingCartImage = false;

    close() {
        this.reset();
        this.uiState.closeUploadImageModal();
    }

    reset(): void {
        this.status$.next('idle');
        this.isShoppingCartImage = false;
        this.selectedFile = undefined;
    }

    uploadImage(): void {
        if (!this.selectedFile) {
            return;
        }
        this.status$.next('loading');
        const formattedFile = this.selectedFile;
        this.tourGalleryState
            .uploadImage(formattedFile, this.isShoppingCartImage)
            .then(() => {
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    onImageSelect(event: Event): void {
        const file = (<HTMLInputElement>event.target).files?.[0];
        if (!file) {
            this.selectedFile = undefined;
            return;
        }
        this.selectedFile = file;
        this.selectedFile.imgSrc = URL.createObjectURL(file);
    }
}
