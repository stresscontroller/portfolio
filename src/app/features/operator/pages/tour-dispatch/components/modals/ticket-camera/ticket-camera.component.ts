import { CommonModule } from '@angular/common';
import { Component, inject, NgZone } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CameraComponent, LoaderEmbedComponent } from '@app/shared';
import { compressImage, OTCBookingItem } from '@app/core';
import { BookingState, UIState } from '../../../state';
import { distinctUntilChanged, filter, map, Subject, takeUntil } from 'rxjs';
import { DialogModule } from 'primeng/dialog';

@Component({
    standalone: true,
    selector: 'app-ticket-camera-modal',
    templateUrl: './ticket-camera.component.html',
    styleUrls: ['./ticket-camera.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        LoaderEmbedComponent,
        DialogModule,
        CameraComponent,
    ],
})
export class TicketCameraModalComponent {
    uiState = inject(UIState);
    bookingState = inject(BookingState);

    ticketCameraModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.ticketCamera),
        distinctUntilChanged()
    );
    uploadStatus$ = this.bookingState.status$.pipe(
        map((status) => status.uploadImage)
    );

    isOpen$ = this.ticketCameraModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.ticketCameraModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    private ngZone = inject(NgZone);
    private context:
        | { booking: OTCBookingItem; onSuccess: () => void }
        | undefined;

    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.context$.pipe(takeUntil(this.destroyed$)).subscribe((cx) => {
            this.context = cx;
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.uiState.closeTicketCameraModal();
    }

    uploadPhoto(file?: File): void {
        if (!file || !this.context) {
            return;
        }
        this.bookingState
            .uploadTicketImage({
                bookingId: this.context.booking.bookingId,
                bookingImage: file,
                bookingImagePath: file.name,
                createdBy: '',
                imageId: '',
            })
            .then(() => {
                this.context?.onSuccess();
                this.ngZone.run(() => {
                    this.close();
                });
            })
            .catch(() => {
                // TODO: error handling
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
                this.uploadPhoto(compressedFile);
            })
            .catch(() => {
                this.uploadPhoto(file);
            });
    }
}
