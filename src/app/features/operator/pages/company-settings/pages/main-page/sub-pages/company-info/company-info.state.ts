import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

import {
    UIStatus,
    UserState,
    CurrencyListItem,
    TimeZoneListItem,
    CompanyInfo,
    CompanyInfoConfig,
    CompanySettingsApiService,
} from '@app/core';

@Injectable()
export class CompanyInfoState {
    userState = inject(UserState);
    companySettingsApiService = inject(CompanySettingsApiService);
    currencyList$ = new BehaviorSubject<CurrencyListItem[]>([]);
    timeZoneList$ = new BehaviorSubject<TimeZoneListItem[]>([]);
    companyInfo$ = new BehaviorSubject<CompanyInfo | undefined>(undefined);

    status$ = new BehaviorSubject<{
        loadCompanyInfo: UIStatus;
        saveCompanyInfo: UIStatus;
    }>({
        loadCompanyInfo: 'idle',
        saveCompanyInfo: 'idle',
    });

    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.getCurrencyList();
        this.getTimeZoneList();
        this.refreshTriggered$.subscribe(() => {
            this.getCompanyInfo();
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    getCurrencyList(): Promise<void> {
        this.currencyList$.next([]);
        return lastValueFrom(this.companySettingsApiService.getCurrencyList())
            .then((res) => {
                this.currencyList$.next(res.data);
                return Promise.resolve();
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    getTimeZoneList(): Promise<void> {
        this.timeZoneList$.next([]);
        return lastValueFrom(this.companySettingsApiService.getTimeZoneList())
            .then((res) => {
                this.timeZoneList$.next(res.data);
                return Promise.resolve();
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    getCompanyInfo(): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID ?? '';
        this.updateStatus('loadCompanyInfo', 'loading');
        this.companyInfo$.next(undefined);
        return lastValueFrom(
            this.companySettingsApiService.getCompanyInfo(companyID)
        )
            .then((res) => {
                this.updateStatus('loadCompanyInfo', 'success');
                this.companyInfo$.next(res.data);
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('loadCompanyInfo', 'error');
                return Promise.reject(error);
            });
    }

    saveCompanyInfo(config: CompanyInfoConfig): Promise<void> {
        this.updateStatus('saveCompanyInfo', 'loading');
        return lastValueFrom(
            this.companySettingsApiService.saveCompanyInfo(config)
        )
            .then((res) => {
                this.updateStatus('saveCompanyInfo', 'success');
                this.companyInfo$.next(res.data);
            })
            .then(() => {
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('saveCompanyInfo', 'error');
                return Promise.reject(error);
            });
    }

    private updateStatus(
        key: 'loadCompanyInfo' | 'saveCompanyInfo',
        status: string
    ): void {
        this.status$.next({
            ...this.status$.getValue(),
            [key]: status,
        });
    }
}
