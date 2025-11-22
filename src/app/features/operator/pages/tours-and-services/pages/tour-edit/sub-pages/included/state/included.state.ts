import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
    UserState,
    TourInventoryApiService,
    TourServicesApiService,
    TourIncludedItem,
    UIStatus,
} from '@app/core';
import { UIState } from './ui.state';
import { TourEditState } from '../../../state';

@Injectable()
export class TourIncludedState {
    userState = inject(UserState);
    uiState = inject(UIState);
    tourEditState = inject(TourEditState);
    tourInventoryApiService = inject(TourInventoryApiService);
    tourServicesApiService = inject(TourServicesApiService);
    tourDetails$ = this.tourEditState.tourDetails$;
    status$ = new BehaviorSubject<{
        save: UIStatus;
    }>({
        save: 'idle',
    });

    whatsIncluded$ = new BehaviorSubject<TourIncludedItem[] | null>(null);
    whatsNotIncluded$ = new BehaviorSubject<TourIncludedItem[] | null>(null);

    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        this.tourDetails$.subscribe((details) => {
            if (details) {
                const capitalizeFirstLetter = (text: string) => {
                    if (!text) {
                        return '';
                    }
                    return text.charAt(0).toUpperCase() + text.slice(1);
                };

                const whatsIncluded: TourIncludedItem[] = details.whatsIncluded
                    .split(',')
                    .map((description, index) => ({
                        index,
                        description: capitalizeFirstLetter(description.trim()),
                        type: 'isIncluded',
                    }));
                this.whatsIncluded$.next(whatsIncluded);

                const whatsNotIncluded: TourIncludedItem[] =
                    details.whatsNotIncluded
                        .split(',')
                        .map((description, index) => ({
                            index,
                            description: capitalizeFirstLetter(
                                description.trim()
                            ),
                            type: 'notIncluded',
                        }));
                this.whatsNotIncluded$.next(whatsNotIncluded);
            }
        });
    }

    refresh(): void {
        this.tourEditState.refresh();
    }

    saveTourIncluded(isIncluded: string, notIncluded: string): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            save: 'loading',
        });
        const tourId = this.tourEditState.tourId$.getValue();
        if (!tourId) {
            this.status$.next({
                ...this.status$.getValue(),
                save: 'error',
            });
            return Promise.resolve();
        }
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.b2CUserId) {
                    return Promise.reject('missing userId');
                }
                return this.tourServicesApiService.saveTourWhatsInclude({
                    tourId: tourId,
                    whatsIncluded: isIncluded,
                    whatsNotIncluded: notIncluded,
                    createdBy: user.b2CUserId,
                });
            })
            .then(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    save: 'success',
                });
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    save: 'error',
                });
                return Promise.resolve();
            });
    }
}
