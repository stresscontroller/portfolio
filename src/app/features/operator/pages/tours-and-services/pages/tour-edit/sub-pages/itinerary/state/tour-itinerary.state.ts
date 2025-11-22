import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import {
    TourServiceItineraryConfig,
    UserState,
    TourServicesApiService,
    TourInventoryApiService,
    TourItinerary,
    TourServiceItineraryListItems,
} from '@app/core';
import { UIState } from './ui.state';
import { TourEditState } from '../../../state';

@Injectable()
export class TourItineraryState {
    uiState = inject(UIState);
    userState = inject(UserState);
    tourEditState = inject(TourEditState);
    tourInventoryApiService = inject(TourInventoryApiService);
    tourServicesApiService = inject(TourServicesApiService);

    tourDetails$ = this.tourEditState.tourDetails$;
    tourId$ = this.tourEditState.tourId$;

    refresh(): void {
        this.tourEditState.refresh();
    }

    saveTourItinerary(config: TourServiceItineraryConfig): Promise<number> {
        const tourId = this.tourEditState.tourId$.getValue();
        if (!tourId) {
            return Promise.reject('missing tourId');
        }
        return lastValueFrom(
            this.tourServicesApiService.saveTourItinerary({
                ...config,
                tourId: tourId,
            })
        ).then((res) => {
            if (typeof res === 'number') {
                return Promise.resolve(res);
            } else if (res && res.success) {
                return Promise.resolve(res.data);
            } else {
                return Promise.reject('Error saving tour itinerary');
            }
        });
    }

    saveTourItineraryList(
        config: TourServiceItineraryListItems[]
    ): Promise<void> {
        return lastValueFrom(
            this.tourServicesApiService.saveTourItineraryList({
                createdBy: '',
                tourItineraryList: config,
            })
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.error);
            }
            return Promise.resolve();
        });
    }

    deleteTourItinerary(config: TourItinerary): Promise<void> {
        return lastValueFrom(
            this.tourServicesApiService.deleteTourItinerar(
                config.tourItineraryId
            )
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.error);
            }
            return Promise.resolve();
        });
    }
}
