import { Injectable, inject } from '@angular/core';
import {
    UserState,
    UserManagementApiService,
    UserCertificationsData,
    UIStatus,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, of, map, tap, catchError } from 'rxjs';
import { UIState } from './ui.state';
import { UserEditState } from '../../../state';

@Injectable()
export class CertificationsState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);
    uiState = inject(UIState);
    userEditState = inject(UserEditState);
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
    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    saveQualification(formData: FormData) {
        const editUserId = this.userEditState.editUserId$.getValue();
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID || !user.id) {
                return Promise.reject(
                    'User or company information is missing.'
                );
            }
            formData.append('CompanyUniqueId', user.companyUniqueID);
            formData.append('Userid', editUserId || '');
            return lastValueFrom(
                this.userManagementApiService.saveQualification(formData)
            );
        });
    }

    loadUserQualificationData() {
        const editUserId = this.userEditState.editUserId$.getValue();
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID || !user.id) {
                    // TODO: throw error
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.userManagementApiService
                        .loadUserQualificationData(
                            user.companyUniqueID,
                            editUserId || ''
                        )
                        .pipe(
                            map((res) => res.data || []),
                            tap((data) => {
                                this.userCertifications$.next(data);
                            })
                        )
                );
            })
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            });
    }

    deleteQualification(context: UserCertificationsData) {
        return lastValueFrom(
            this.userManagementApiService
                .deleteQualification(context.userQualificationLicenseId)
                .pipe(
                    tap((res) => {
                        if (res.success) {
                            this.refresh();
                        }
                    }),
                    catchError((error) => {
                        return of(error);
                    })
                )
        );
    }
}
