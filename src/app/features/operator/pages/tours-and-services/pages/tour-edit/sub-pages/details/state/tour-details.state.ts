import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import {
    UserState,
    TourInventoryApiService,
    SaveTourDetailsConfig,
} from '@app/core';
import { TourEditState } from '../../../state';

@Injectable()
export class TourDetailsState {
    userState = inject(UserState);
    tourEditState = inject(TourEditState);
    tourInventoryApiService = inject(TourInventoryApiService);

    saveTourDetails(config: SaveTourDetailsConfig) {
        return this.userState.getAspNetUser().then((user) => {
            const tourId = this.tourEditState.tourId$.getValue();
            if (user && tourId) {
                return lastValueFrom(
                    this.tourInventoryApiService.saveTourDetails({
                        ...config,
                        tourId: tourId ?? 0,
                        createdBy: user.b2CUserId ?? '',
                        companyId: user.companyUniqueID ?? '',
                    })
                ).then(() => {
                    this.tourEditState.refresh();
                    return Promise.resolve();
                });
            } else {
                return Promise.reject('missing user information or tourId');
            }
        });
    }
}
