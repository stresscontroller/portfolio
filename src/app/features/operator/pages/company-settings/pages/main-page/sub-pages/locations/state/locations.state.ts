import { Injectable, inject } from '@angular/core';
import {
    UIStatus,
    UserState,
    CompanyLocationListItem,
    UserManagementApiService,
    CompanySettingsApiService,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Injectable()
export class LocationsState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);
    companySettingsApiService = inject(CompanySettingsApiService);
    locationType$ = new BehaviorSubject<string[]>([]);
    companyLocationList$ = new BehaviorSubject<CompanyLocationListItem[]>([]);
    statuses$ = new BehaviorSubject<{
        loadCompanyLocationList: UIStatus;
        saveCompanyLocation: UIStatus;
    }>({
        loadCompanyLocationList: 'idle',
        saveCompanyLocation: 'idle',
    });

    config$ = new BehaviorSubject<{
        locationType: string;
        refreshTriggered: number;
    }>({
        locationType: '',
        refreshTriggered: 0,
    });

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.loadLocationType();
        this.config$.subscribe((config) => {
            this.getCompanyLocationList(config.locationType);
        });
    }

    refresh(): void {
        this.config$.next({
            ...this.config$.getValue(),
            refreshTriggered: new Date().getTime(),
        });
    }

    setLocationType(locationType: string): void {
        this.config$.next({
            ...this.config$.getValue(),
            locationType,
        });
    }

    loadLocationType(): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyID) {
            return Promise.resolve();
        }
        this.locationType$.next([]);
        return lastValueFrom(
            this.userManagementApiService.loadLocationType(companyID)
        )
            .then((res) => {
                this.locationType$.next(res.data);
                return Promise.resolve();
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    getCompanyLocationList(locationType: string): Promise<void> {
        const companyUniqueID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyUniqueID) {
            return Promise.resolve();
        }
        this.updateIsStatus('loadCompanyLocationList', 'loading');
        this.companyLocationList$.next([]);
        return lastValueFrom(
            this.companySettingsApiService.getCompanyLocationList(
                companyUniqueID,
                locationType
            )
        )
            .then((res) => {
                this.updateIsStatus('loadCompanyLocationList', 'success');
                this.companyLocationList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.updateIsStatus('loadCompanyLocationList', 'error');
            });
    }

    private updateIsStatus(
        key: 'loadCompanyLocationList' | 'saveCompanyLocation',
        status: string
    ): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
