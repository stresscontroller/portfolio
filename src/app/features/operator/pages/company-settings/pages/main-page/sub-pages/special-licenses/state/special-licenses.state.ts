import { Injectable, inject } from '@angular/core';
import {
    UIStatus,
    UserState,
    CompanySpecialLicenseListItem,
    CompanySpecialLicenseConfig,
    CompanySettingsApiService,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Injectable()
export class SpecialLicensesState {
    userState = inject(UserState);
    companySettingsApiService = inject(CompanySettingsApiService);

    statuses$ = new BehaviorSubject<{
        loadCompanySpecialLicenseList: UIStatus;
        saveCompanySpecialLicense: UIStatus;
    }>({
        loadCompanySpecialLicenseList: 'idle',
        saveCompanySpecialLicense: 'idle',
    });
    companySpecialLicenseList$ = new BehaviorSubject<
        CompanySpecialLicenseListItem[]
    >([]);

    config$ = new BehaviorSubject<{
        refreshTriggered: number;
    }>({
        refreshTriggered: 0,
    });

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.config$.subscribe(() => {
            this.getCompanySpecialLicenseList();
        });
    }

    refresh(): void {
        this.config$.next({
            ...this.config$.getValue(),
            refreshTriggered: new Date().getTime(),
        });
    }

    getCompanySpecialLicenseList(): Promise<void> {
        const companyUniqueID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyUniqueID) {
            return Promise.resolve();
        }
        this.updateIsStatus('loadCompanySpecialLicenseList', 'loading');
        this.companySpecialLicenseList$.next([]);
        return lastValueFrom(
            this.companySettingsApiService.getCompanySpecialLicenseList(
                companyUniqueID
            )
        )
            .then((res) => {
                this.updateIsStatus('loadCompanySpecialLicenseList', 'success');
                this.companySpecialLicenseList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.updateIsStatus('loadCompanySpecialLicenseList', 'error');
            });
    }

    saveSpecailLicense(config: CompanySpecialLicenseConfig): Promise<void> {
        this.updateIsStatus('saveCompanySpecialLicense', 'loading');
        return this.userState.getAspNetUser().then((user) => {
            return lastValueFrom(
                this.companySettingsApiService.saveCompanySpecialLicenseList({
                    ...config,
                    companyUniqueId: user?.companyUniqueID ?? '',
                    userid: user?.id ?? '',
                })
            )
                .then((res) => {
                    if (res.success) {
                        this.refresh();
                        this.updateIsStatus(
                            'saveCompanySpecialLicense',
                            'success'
                        );
                        return Promise.resolve();
                    } else {
                        return Promise.reject(res.error);
                    }
                })
                .catch(() => {
                    this.updateIsStatus('saveCompanySpecialLicense', 'error');
                });
        });
    }

    deleteSpecialLicense(
        specialLicenseId: number,
        isActive: boolean
    ): Promise<void> {
        this.updateIsStatus('saveCompanySpecialLicense', 'loading');
        return lastValueFrom(
            this.companySettingsApiService.deleteSpecialLicense(
                specialLicenseId,
                isActive
            )
        ).then((res) => {
            if (!res.success) {
                this.updateIsStatus('saveCompanySpecialLicense', 'error');
                return Promise.reject(res.error);
            }
            this.refresh();
            this.updateIsStatus('saveCompanySpecialLicense', 'success');
            return Promise.resolve();
        });
    }

    private updateIsStatus(
        key: 'loadCompanySpecialLicenseList' | 'saveCompanySpecialLicense',
        status: 'idle' | 'loading' | 'success' | 'error'
    ): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
