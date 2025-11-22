import { Injectable, inject } from '@angular/core';
import {
    UserState,
    UserManagementApiService,
    UserCertificationsData,
    UIStatus,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, map } from 'rxjs';
import { UIState } from './ui.state';

@Injectable()
export class CertificationsState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);
    uiState = inject(UIState);

    status$ = new BehaviorSubject<UIStatus>('idle');
    userCertifications$ = new BehaviorSubject<UserCertificationsData[]>([]);

    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.refreshTriggered$.subscribe(() => {
            this.loadUserQualificationData();
        });
    }

    loadUserQualificationData(): void {
        this.status$.next('loading');
        this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.companyUniqueID || !user.id) {
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.userManagementApiService
                        .loadUserQualificationData(
                            user.companyUniqueID,
                            user.id
                        )
                        .pipe(map((res) => res.data || []))
                );
            })
            .then((res) => {
                this.status$.next('success');
                this.userCertifications$.next(res);
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    saveQualification(formData: FormData): Promise<void> {
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.companyUniqueID || !user.id) {
                    return Promise.reject('missing user information');
                }
                formData.append('CompanyUniqueId', user.companyUniqueID);
                formData.append('Userid', user.id);
                return lastValueFrom(
                    this.userManagementApiService.saveQualification(formData)
                );
            })
            .then((res) => {
                if (res?.success) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(res?.errors);
                }
            });
    }

    deleteQualification(context: UserCertificationsData): Promise<void> {
        return lastValueFrom(
            this.userManagementApiService.deleteQualification(
                context.userQualificationLicenseId
            )
        ).then((res) => {
            if (res.success) {
                return Promise.resolve();
            } else {
                return Promise.reject(res.error);
            }
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }
}
