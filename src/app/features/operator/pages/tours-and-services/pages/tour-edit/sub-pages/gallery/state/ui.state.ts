import { Injectable } from '@angular/core';
import { TourGalleryItem } from '@app/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        uploadImage: {
            isOpen: boolean;
        };
        deleteImage: {
            isOpen: boolean;
            context?: TourGalleryItem;
        };
    }>({
        uploadImage: {
            isOpen: false,
        },
        deleteImage: {
            isOpen: false,
        },
    });

    openUploadImageModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            uploadImage: {
                isOpen: true,
            },
        });
    }

    closeUploadImageModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            uploadImage: {
                isOpen: false,
            },
        });
    }

    openDeleteImageModal(image: TourGalleryItem): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteImage: {
                isOpen: true,
                context: image,
            },
        });
    }

    closeDeleteItemModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteImage: {
                isOpen: false,
            },
        });
    }
}
