import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { DividerModule } from 'primeng/divider';
import { Features, TourGalleryItem, UIState as CoreUIState } from '@app/core';
import { UIState, TourGalleryState } from './state';
import {
    RemoveImageModalComponent,
    UploadImageModalComponent,
} from './components';
import { ButtonModule } from 'primeng/button';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        DividerModule,
        LoaderEmbedComponent,
        RemoveImageModalComponent,
        UploadImageModalComponent,
        PermissionDirective,
    ],
    providers: [UIState, TourGalleryState],
})
export class GalleryComponent {
    uiState = inject(UIState);
    coreUIState = inject(CoreUIState);
    tourGalleryState = inject(TourGalleryState);
    features = Features;
    status$ = this.tourGalleryState.status$.pipe(
        map((status) => status.loadTourImages)
    );
    tourImages$ = this.tourGalleryState.tourImages$;
    shoppingCartImage$ = this.tourGalleryState.tourDetails$.pipe(
        map((tourDetails) => tourDetails?.shoppingCartImagePath)
    );
    alaskaxImages$ = this.tourGalleryState.tourImages$.pipe(
        map((images) =>
            images.filter(
                (image) =>
                    image.isHeader === false && image.isShoppingCart === false
            )
        )
    );
    cruiseCodeImages$ = combineLatest([
        this.tourGalleryState.tourImages$,
        this.shoppingCartImage$,
    ]).pipe(
        map(([images, shoppingCartImage]) =>
            images
                .filter(
                    (image) =>
                        image.isHeader === true || image.isShoppingCart === true
                )
                .map((image) => {
                    return {
                        ...image,
                        displayShoppingCartBadge:
                            (shoppingCartImage &&
                                image.imagePath === shoppingCartImage) ||
                            image.shoppingCartImagePath === shoppingCartImage,
                    };
                })
                .reverse()
                .sort((a, b) => {
                    return (
                        Number(b.displayShoppingCartBadge) -
                        Number(a.displayShoppingCartBadge)
                    );
                })
        )
    );

    ngOnInit(): void {
        this.tourGalleryState.init();
    }

    openUploadImageModal(): void {
        this.uiState.openUploadImageModal();
    }

    openDeleteImageModal(image: TourGalleryItem): void {
        this.uiState.openDeleteImageModal(image);
    }

    viewImage(image: TourGalleryItem): void {
        const imageSrc = image.isShoppingCart
            ? image.shoppingCartImagePath
            : image.imagePath;
        this.coreUIState.openLightbox({ image: imageSrc });
    }
}
