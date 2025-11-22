import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import {
    FiltersApiService,
    TourDetails,
    TourDeleteConfig,
    TourInventoryApiService,
    UserState,
    UIStatus,
    SaveTourDetailsConfig,
} from '@app/core';

@Injectable()
export class TourListState {
    userState = inject(UserState);
    filtersApiService = inject(FiltersApiService);
    tourInventoryApiService = inject(TourInventoryApiService);

    tours$ = new BehaviorSubject<TourDetails[]>([]);
    status$ = new BehaviorSubject<UIStatus>('idle');
    config$ = new BehaviorSubject<{
        showInActive: boolean;
        refreshTriggered: number;
    }>({
        showInActive: false,
        refreshTriggered: 0,
    });

    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        this.config$.subscribe((config) => {
            this.loadTours(config.showInActive);
        });
    }

    loadTours(showInActive: boolean): Promise<void> {
        this.tours$.next([]);
        this.status$.next('loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (user?.companyUniqueID) {
                    return lastValueFrom(
                        this.tourInventoryApiService.getToursByCompanyId(
                            user.companyUniqueID,
                            showInActive
                        )
                    ).then((res) => {
                        return Promise.resolve(res.data);
                    });
                }
                return Promise.reject('No companyUniqueID');
            })
            .then((tours) => {
                this.tours$.next(tours || []);
                this.status$.next('success');
            })
            .catch(() => {
                return Promise.resolve();
            });
    }

    refresh(): void {
        this.config$.next({
            ...this.config$.getValue(),
            refreshTriggered: new Date().getTime(),
        });
    }

    setShowInactive(showInActive: boolean): void {
        this.config$.next({
            ...this.config$.getValue(),
            showInActive,
        });
    }

    saveTour(config: SaveTourDetailsConfig): Promise<void> {
        return lastValueFrom(
            this.tourInventoryApiService.saveTourDetails(config)
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.error);
            }
            return Promise.resolve();
        });
    }

    deleteTour(tourId: number, isActive: boolean): Promise<void> {
        const config: TourDeleteConfig = {
            tourId: tourId,
            isActive: isActive,
            createdBy: '',
        };
        return lastValueFrom(
            this.tourInventoryApiService.deleteTour(config)
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.error);
            }
            return Promise.resolve();
        });
    }
}
