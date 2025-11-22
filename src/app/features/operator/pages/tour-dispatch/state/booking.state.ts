import { inject, Injectable, NgZone } from '@angular/core';
import {
    BookingImage,
    DtdApiService,
    NewBookingImage,
    UIStatus,
    UserState,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Injectable()
export class BookingState {
    private zone = inject(NgZone);
    dtdApiService = inject(DtdApiService);
    userState = inject(UserState);
    status$ = new BehaviorSubject<{
        loadBookingImages: UIStatus;
        uploadImage: UIStatus;
    }>({
        loadBookingImages: 'idle',
        uploadImage: 'idle',
    });
    bookingImages$ = new BehaviorSubject<Record<string, BookingImage[]>>({});
    loadBookingImages(bookingId: number): void {
        this.updateStatus('loadBookingImages', 'loading');
        this.zone.run(() => {
            this.bookingImages$.next({
                [bookingId.toString()]: [],
            });
        });
        lastValueFrom(this.dtdApiService.getBookingImages(bookingId))
            .then((res) => {
                this.updateStatus('loadBookingImages', 'idle');
                this.zone.run(() => {
                    this.bookingImages$.next({
                        [bookingId.toString()]: res.data,
                    });
                });
            })
            .catch(() => {
                this.updateStatus('loadBookingImages', 'error');
            });
    }

    uploadTicketImage(newBookingImage: NewBookingImage) {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.b2CUserId) {
                return Promise.reject('missing userId');
            }
            this.updateStatus('uploadImage', 'loading');
            return lastValueFrom(
                this.dtdApiService.saveBookingImage({
                    ...newBookingImage,
                    createdBy: user.b2CUserId,
                })
            )
                .then((res) => {
                    if (!res.success) {
                        return Promise.reject(res.errors);
                    }
                    this.updateStatus('uploadImage', 'idle');
                    return Promise.resolve();
                })
                .catch((err) => {
                    this.updateStatus('uploadImage', 'error');
                    return Promise.reject(err);
                });
        });
    }

    deleteTicketImage(imageId: number) {
        return lastValueFrom(
            this.dtdApiService.deleteBookingImage(imageId)
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.errors);
            }
            return Promise.resolve();
        });
    }

    private updateStatus(
        statusKey: 'uploadImage' | 'loadBookingImages',
        status: UIStatus
    ): void {
        this.zone.run(() => {
            this.status$.next({
                ...this.status$.getValue(),
                [statusKey]: status,
            });
        });
    }
}
