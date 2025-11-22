import { Injectable, inject } from '@angular/core';
import {
    UIStatus,
    UserState,
    CompanyQualificationListItem,
    CompanyQualificationConfig,
    CompanySettingsApiService,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Injectable()
export class QualificationsState {
    userState = inject(UserState);
    companySettingsApiService = inject(CompanySettingsApiService);
    qualificationList$ = new BehaviorSubject<CompanyQualificationListItem[]>(
        []
    );
    statuses$ = new BehaviorSubject<{
        loadQualificationList: UIStatus;
        saveQualification: UIStatus;
    }>({
        loadQualificationList: 'idle',
        saveQualification: 'idle',
    });

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
            this.getQualificationList();
        });
    }

    refresh(): void {
        this.config$.next({
            ...this.config$.getValue(),
            refreshTriggered: new Date().getTime(),
        });
    }

    getQualificationList(): Promise<void> {
        const companyUniqueID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyUniqueID) {
            return Promise.resolve();
        }
        this.updateStatus('loadQualificationList', 'loading');
        this.qualificationList$.next([]);
        return lastValueFrom(
            this.companySettingsApiService.getQualificationList(companyUniqueID)
        )
            .then((res) => {
                this.updateStatus('loadQualificationList', 'success');
                this.qualificationList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.updateStatus('loadQualificationList', 'error');
            });
    }

    saveQualification(config: CompanyQualificationConfig): Promise<void> {
        this.updateStatus('saveQualification', 'loading');
        return this.userState.getAspNetUser().then((user) => {
            return lastValueFrom(
                this.companySettingsApiService.saveQualification({
                    ...config,
                    companyUniqueId: user?.companyUniqueID ?? '',
                })
            )
                .then((res) => {
                    if (res.success) {
                        this.refresh();
                        this.updateStatus('saveQualification', 'success');
                        return Promise.resolve();
                    } else {
                        return Promise.reject(res.error);
                    }
                })
                .catch(() => {
                    this.updateStatus('saveQualification', 'error');
                });
        });
    }

    deleteQualification(
        specialLicenseId: number,
        isActive: boolean
    ): Promise<void> {
        this.updateStatus('saveQualification', 'loading');
        return lastValueFrom(
            this.companySettingsApiService.deleteQualification(
                specialLicenseId,
                isActive
            )
        ).then((res) => {
            if (res.success) {
                this.refresh();
                this.updateStatus('saveQualification', 'success');
                return Promise.resolve();
            } else {
                this.updateStatus('saveQualification', 'error');
                return Promise.reject(res.error);
            }
        });
    }

    private updateStatus(
        key: 'loadQualificationList' | 'saveQualification',
        status: 'idle' | 'loading' | 'success' | 'error'
    ): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
