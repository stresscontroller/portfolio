import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom, switchMap, map } from 'rxjs';
import {
    TourPriceDetails,
    TourPriceDetailsConfig,
    UserState,
    TourServicesApiService,
    TourInventoryApiService,
    UIStatus,
} from '@app/core';
import { TourEditState } from '../../../state';

@Injectable()
export class TourPriceState {
    userState = inject(UserState);
    tourEditState = inject(TourEditState);
    tourInventoryApiService = inject(TourInventoryApiService);
    tourServicesApiService = inject(TourServicesApiService);

    tourPrices$ = new BehaviorSubject<TourPriceDetails[]>([]);
    status$ = new BehaviorSubject<UIStatus>('idle');
    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.tourEditState.tourId$
            .pipe(
                switchMap((tourId) =>
                    this.refreshTriggered$.pipe(map(() => tourId))
                )
            )
            .subscribe((tourId) => {
                this.tourPrices$.next([]);
                if (tourId) {
                    this.loadTourPrices(tourId);
                }
            });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    loadTourPrices(tourId: number): Promise<void> {
        this.status$.next('loading');
        this.tourPrices$.next([]);
        return lastValueFrom(this.tourInventoryApiService.getTourPrices(tourId))
            .then((res) => {
                return Promise.resolve(res.data);
            })
            .then((tourPrices) => {
                this.tourPrices$.next(tourPrices);
                this.status$.next('success');
            })
            .catch(() => {
                return Promise.resolve();
            });
    }

    saveTourPrice(config: TourPriceDetailsConfig): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.b2CUserId) {
                return Promise.reject('missing user id');
            }
            return lastValueFrom(
                this.tourServicesApiService.saveTourPrice({
                    ...config,
                    createdBy: user.b2CUserId,
                })
            ).then((res) => {
                if (!res.success) {
                    return Promise.reject(res.error);
                }
                return Promise.resolve();
            });
        });
    }

    deleteTourPrice(config: TourPriceDetails): Promise<void> {
        this.status$.next('loading');
        return lastValueFrom(
            this.tourServicesApiService.deleteTourPrice(config.id)
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.error);
            }
            return Promise.resolve();
        });
    }
}
