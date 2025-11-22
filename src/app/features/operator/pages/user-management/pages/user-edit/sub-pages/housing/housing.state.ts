import { Injectable, inject } from '@angular/core';
import {
    UserHousingApiService,
    UserState,
    UserManagementApiService,
    LocationData,
    UIStatus,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, map, take } from 'rxjs';
import { UserEditState } from '../../state';
import { HousingDataItem, HousingDataConfig } from '@app/core';

import { UIState } from '@app/core';

@Injectable()
export class HousingState {
    uiState = inject(UIState);
    userState = inject(UserState);
    userEditState = inject(UserEditState);

    UserHousingApiService = inject(UserHousingApiService);
    userManagementApiService = inject(UserManagementApiService);

    isLoading$ = new BehaviorSubject<{
        loadLocations: UIStatus;
        loadHousingData: UIStatus;
        saveHousingData: UIStatus;
    }>({
        loadLocations: 'idle',
        loadHousingData: 'idle',
        saveHousingData: 'idle',
    });

    locations$ = new BehaviorSubject<LocationData[]>([]);
    loadLocations(): Promise<LocationData[]> {
        const locations = this.locations$.getValue();
        if (locations.length > 0) {
            return Promise.resolve(locations);
        }
        if (this.isLoading$.getValue().loadLocations === 'loading') {
            return lastValueFrom(this.locations$.pipe(take(1)));
        }
        this.updateIsLoading('loadLocations', 'loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                return lastValueFrom(
                    this.userManagementApiService
                        .loadLocationDataByType(
                            user?.companyUniqueID ?? '',
                            'Housing'
                        )
                        .pipe(map((res) => res.data))
                ).then((data) => {
                    this.locations$.next(data);
                    return data;
                });
            })
            .catch(() => {
                this.updateIsLoading('loadLocations', 'error');
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('loadLocations', 'success');
            });
    }

    housingData$ = new BehaviorSubject<HousingDataItem | null>(null);
    loadHousingData(): Promise<HousingDataItem | undefined> {
        // const housingData = this.housingData$.getValue();
        // if (housingData.length > 0) {
        //     return Promise.resolve(housingData);
        // }
        // if (this.isLoading$.getValue().loadHousingData === 'loading') {
        //     return lastValueFrom(this.housingData$.pipe(take(1)));
        // }
        this.updateIsLoading('loadHousingData', 'loading');
        const editUserId = String(this.userEditState.editUserId$.getValue());
        return this.userState
            .getAspNetUser()
            .then((user) => {
                return lastValueFrom(
                    this.UserHousingApiService.loadUserHousingData(
                        editUserId,
                        user?.companyUniqueID ?? ''
                    ).pipe(map((res) => res.data))
                ).then((data) => {
                    this.housingData$.next(data);
                    return data;
                });
            })
            .catch(() => {
                this.updateIsLoading('loadHousingData', 'error');
                return Promise.resolve(undefined);
            })
            .finally(() => {
                this.updateIsLoading('loadHousingData', 'success');
            });
    }

    saveHousingData(config: HousingDataConfig) {
        this.updateIsLoading('saveHousingData', 'loading');
        const editUserId = this.userEditState.editUserId$.getValue();
        if (!editUserId) {
            return Promise.reject('no edit user id');
        }
        return lastValueFrom(
            this.UserHousingApiService.saveUserHousingData({
                ...config,
                userId: editUserId,
            })
        )
            .then((res) => {
                this.updateIsLoading('saveHousingData', 'success');
                this.housingData$.next(res.data);
            })
            .then(() => {
                return Promise.resolve();
            })
            .catch(() => {
                this.updateIsLoading('saveHousingData', 'error');
            });
    }

    private updateIsLoading(
        key: 'loadLocations' | 'loadHousingData' | 'saveHousingData',
        isLoading: string
    ): void {
        this.isLoading$.next({
            ...this.isLoading$.getValue(),
            [key]: isLoading,
        });
    }
}
