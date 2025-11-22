import { Injectable, inject } from '@angular/core';
import { UIStatus, TourServicesApiService } from '@app/core';
import { BehaviorSubject, lastValueFrom, map, switchMap } from 'rxjs';
import { TourGalleryItem, UserState } from '@app/core';
import { TourEditState } from '../../../state';

@Injectable()
export class TourGalleryState {
    userState = inject(UserState);
    tourEditState = inject(TourEditState);
    tourServicesApiService = inject(TourServicesApiService);

    status$ = new BehaviorSubject<{
        loadTourImages: UIStatus;
    }>({
        loadTourImages: 'idle',
    });
    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;

    tourImages$ = new BehaviorSubject<TourGalleryItem[] | []>([]);
    tourDetails$ = this.tourEditState.tourDetails$;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.tourEditState.tourId$
            .pipe(
                switchMap((tourId) => {
                    return this.refreshTriggered$.pipe(map(() => tourId));
                })
            )
            .subscribe((tourId) => {
                if (tourId) {
                    this.loadTourImages(tourId);
                }
            });
    }

    loadTourImages(tourId: number): Promise<void> {
        this.updateStatus('loadTourImages', 'loading');
        this.tourImages$.next([]);
        return lastValueFrom(this.tourServicesApiService.getTourImages(tourId))
            .then((res) => {
                return Promise.resolve(res.data);
            })
            .then((tourImages) => {
                this.tourImages$.next(tourImages);
                this.updateStatus('loadTourImages', 'success');
            })
            .catch(() => {
                this.updateStatus('loadTourImages', 'error');
                return Promise.resolve();
            });
    }

    uploadImage(image: File, isShoppingCartImage?: boolean): Promise<void> {
        try {
            const tourDetails = this.tourDetails$.getValue();
            if (!tourDetails) {
                return Promise.reject('missing data');
            }
            return this.userState
                .getAspNetUser()
                .then((user) => {
                    if (!user?.b2CUserId || !user.companyUniqueID) {
                        return Promise.reject('missing user information');
                    }
                    const tourId = this.tourEditState.tourId$.getValue();
                    if (!tourId) {
                        return Promise.reject('missing tourId');
                    }
                    const formData = new FormData();
                    formData.append('Id', '');
                    if (isShoppingCartImage) {
                        formData.append(
                            'ShoppingCartImagePath',
                            image,
                            image.name
                        );
                        formData.append('ShoppingCartImagePathURL', image.name);
                        formData.append('IsShoppingCart', 'true');
                    } else {
                        formData.append('IsShoppingCart', 'false');
                    }
                    formData.append('ImagePath', image, image.name);
                    formData.append('ImagePathURL', image.name);
                    formData.append('TourId', tourId.toString());
                    formData.append('Position', '0');
                    formData.append('IsHeader', 'true'); // set to true for cruisecode images
                    formData.append('CompanyId', user.companyUniqueID);
                    formData.append('CreatedBy', user.b2CUserId);
                    return lastValueFrom(
                        this.tourServicesApiService.saveTourImage(formData)
                    );
                })
                .then((res) => {
                    if (res.success) {
                        this.refresh();
                        return Promise.resolve();
                    }
                    return Promise.reject(res.errors);
                });
        } catch (err) {
            return Promise.reject(err);
        }
    }

    deleteImage(id: number): Promise<void> {
        return lastValueFrom(
            this.tourServicesApiService.deleteTourImage(id)
        ).then((res) => {
            if (res.success) {
                this.refresh();
                return Promise.resolve();
            }
            return Promise.reject(res.error);
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
        this.tourEditState.refresh();
    }

    private updateStatus(key: 'loadTourImages', status: UIStatus): void {
        this.status$.next({
            ...this.status$.getValue(),
            [key]: status,
        });
    }
}
