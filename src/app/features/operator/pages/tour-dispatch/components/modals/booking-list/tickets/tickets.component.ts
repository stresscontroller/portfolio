import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CameraComponent, LoaderEmbedComponent } from '@app/shared';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import {
    BookingImage,
    OTCBookingItem,
    UIState as CoreUIState,
    isIOS,
    compressImage,
} from '@app/core';
import { BookingState, UIState } from '../../../../state';
import { map } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-tickets',
    templateUrl: './tickets.component.html',
    styleUrls: ['./tickets.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        TooltipModule,
        MenuModule,
        LoaderEmbedComponent,
        CameraComponent,
    ],
})
export class TicketsComponent {
    @Input() booking: OTCBookingItem | undefined;
    @Input() bookingImages: BookingImage[] = [];
    @Output() exit = new EventEmitter<boolean>();

    uiState = inject(UIState);
    coreUIState = inject(CoreUIState);
    bookingState = inject(BookingState);

    status$ = this.bookingState.status$.pipe(
        map((status) => status.loadBookingImages)
    );

    allowEmbeddedCamera = !isIOS();

    viewImage(image: string): void {
        this.coreUIState.openLightbox({
            image,
        });
    }

    deleteImage(image: BookingImage): void {
        this.coreUIState.openConfirmationDialog({
            title: 'Are you sure you want to delete this image?',
            description: '',
            buttons: [
                {
                    text: 'Cancel',
                    isPrimary: true,
                    onClick: () => {
                        // close
                    },
                },
                {
                    text: 'Delete',
                    isPrimary: false,
                    onClick: () => {
                        // delete and close
                        this.bookingState
                            .deleteTicketImage(image.id)
                            .then(() => {
                                const bookingId = this.booking?.bookingId;
                                if (bookingId)
                                    this.bookingState.loadBookingImages(
                                        bookingId
                                    );
                            })
                            .catch(() => {
                                // error handling
                            });
                    },
                },
            ],
        });
    }

    openEmbeddedCamera(): void {
        if (!this.booking) {
            return;
        }
        this.uiState.openTicketCameraModal({
            booking: this.booking,
            onSuccess: () => {
                if (this.booking) {
                    this.bookingState.loadBookingImages(this.booking.bookingId);
                }
            },
        });
    }

    onImageSelect(event: Event): void {
        const file = (<HTMLInputElement>event.target).files?.[0];
        if (!file) {
            return;
        }
        compressImage(file, {
            quality: 0.7,
            type: 'image/jpeg',
        })
            .then((compressedFile) => {
                this.uploadSelectedPhoto(compressedFile);
            })
            .catch(() => {
                this.uploadSelectedPhoto(file);
            });
    }

    uploadSelectedPhoto(file?: File): void {
        if (!file || !this.booking) {
            return;
        }
        this.bookingState
            .uploadTicketImage({
                bookingId: this.booking.bookingId,
                bookingImage: file,
                bookingImagePath: file.name,
                createdBy: '',
                imageId: '',
            })
            .then(() => {
                if (this.booking) {
                    this.bookingState.loadBookingImages(this.booking.bookingId);
                }
            })
            .catch(() => {
                // TODO: error handling
            });
    }

    back(): void {
        this.exit.emit();
    }
}
