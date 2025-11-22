import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom, switchMap, tap } from 'rxjs';
import { TourInventoryApiService, UIStatus, TourItem } from '@app/core';

@Injectable()
export class TourEditState {
    tourInventoryApiService = inject(TourInventoryApiService);
    tourId$ = new BehaviorSubject<number | null>(null);
    refreshTriggered$ = new BehaviorSubject<number>(0);

    tourDetails$ = new BehaviorSubject<TourItem | undefined>(undefined);
    status$ = new BehaviorSubject<{
        loadTourDetails: UIStatus;
    }>({
        loadTourDetails: 'idle',
    });

    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.tourId$
            .pipe(
                switchMap((tourId) => {
                    return this.refreshTriggered$.pipe(
                        tap(() => {
                            if (tourId) {
                                this.loadTourDetails(tourId);
                            } else {
                                this.tourDetails$.next(undefined);
                            }
                        })
                    );
                })
            )
            .subscribe();
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    setTourId(tourId: number): void {
        this.tourId$.next(tourId);
    }

    clearTourId(): void {
        this.tourId$.next(null);
    }

    loadTourDetails(tourId: number): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            loadTourDetails: 'loading',
        });
        this.tourDetails$.next(undefined);
        return lastValueFrom(
            this.tourInventoryApiService.getTourDetails(tourId)
        )
            .then((res) => {
                return Promise.resolve(res.data);
            })
            .then((tourDetails) => {
                this.tourDetails$.next(tourDetails);
                this.status$.next({
                    ...this.status$.getValue(),
                    loadTourDetails: 'success',
                });
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadTourDetails: 'error',
                });
                return Promise.resolve();
            });
    }
}
