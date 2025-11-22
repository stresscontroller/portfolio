import { Injectable, inject } from '@angular/core';
import { TourServicesApiService } from '@app/core';
import { lastValueFrom } from 'rxjs';
import { UserState } from '@app/core';
import { TourEditState } from '../../../state';

@Injectable()
export class TourVideoState {
    userState = inject(UserState);
    tourEditState = inject(TourEditState);
    tourServicesApiService = inject(TourServicesApiService);

    tourDetails$ = this.tourEditState.tourDetails$;

    updateTourVideo(video: File): Promise<void> {
        try {
            const tourDetails = this.tourDetails$.getValue();
            if (!tourDetails) {
                return Promise.reject('missing data');
            }
            return this.userState
                .getAspNetUser()
                .then((user) => {
                    if (!user?.b2CUserId) {
                        return Promise.reject('missing user information');
                    }
                    const formData = new FormData();
                    formData.append(
                        'Id',
                        tourDetails.tourVideo?.id?.toString() ?? '0'
                    );
                    formData.append('TourId', tourDetails.tourId.toString());
                    formData.append('VideoPath', video, video.name);
                    formData.append('VideoPathURL', video.name);
                    formData.append('CompanyId', tourDetails.companyUniqueID);
                    formData.append('CreatedBy', user.b2CUserId);
                    return lastValueFrom(
                        this.tourServicesApiService.saveTourVideo(formData)
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

    deleteTourVideo(id: number): Promise<void> {
        return lastValueFrom(
            this.tourServicesApiService.deleteTourVideo(id)
        ).then((res) => {
            if (res.success) {
                return Promise.resolve();
            }
            return Promise.reject(res.error);
        });
    }

    refresh(): void {
        this.tourEditState.refresh();
    }
}
