import { Injectable, inject } from '@angular/core';
import {
    UserState,
    UserQualificationsApiService,
    UserQualificationListItem,
    Qualification,
    UIStatus,
    LicenseOptions,
} from '@app/core';
import {
    BehaviorSubject,
    distinctUntilChanged,
    lastValueFrom,
    map,
    switchMap,
} from 'rxjs';
import { UIState } from './ui.state';
import { UserEditState } from '../../../state';
import { UserManagementApiService } from '@app/core';
@Injectable()
export class SpecialLicensesState {
    userState = inject(UserState);
    uiState = inject(UIState);
    userEditState = inject(UserEditState);
    userQualificationsApiService = inject(UserQualificationsApiService);
    userManagementApiService = inject(UserManagementApiService);
    licenses$ = new BehaviorSubject<UserQualificationListItem[]>([]);
    qualifications$ = new BehaviorSubject<Qualification[]>([]);
    licenseOptions$ = new BehaviorSubject<LicenseOptions[]>([]);
    status$ = new BehaviorSubject<{
        loadQualifications: UIStatus;
        loadLicenseOptions: UIStatus;
        loadLicenses: UIStatus;
    }>({
        loadQualifications: 'idle',
        loadLicenseOptions: 'idle',
        loadLicenses: 'idle',
    });
    private refreshTriggered$ = new BehaviorSubject<number>(0);

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.userState.getAspNetUser().then((user) => {
            const companyUniqueId = user?.companyUniqueID;
            if (companyUniqueId) {
                this.loadQualifications(companyUniqueId);
                this.loadLicenseOptions(companyUniqueId);
            }
            this.userEditState.editUserId$
                .pipe(
                    distinctUntilChanged(),
                    switchMap((editUserId) => {
                        return this.refreshTriggered$.pipe(
                            map(() => editUserId)
                        );
                    })
                )
                .subscribe((editUserId) => {
                    if (editUserId) {
                        this.loadLicenses(editUserId);
                    } else {
                        this.licenses$.next([]);
                    }
                });
        });
    }

    loadQualifications(companyId: string): void {
        this.updateStatus('loadQualifications', 'loading');

        lastValueFrom(
            this.userQualificationsApiService
                .loadQualificationData(companyId)
                .pipe(map((res) => res.data))
        )
            .then((data) => {
                this.updateStatus('loadQualifications', 'success');
                this.qualifications$.next(data);
            })
            .catch(() => {
                this.updateStatus('loadQualifications', 'error');
            });
    }

    loadLicenseOptions(companyId: string): void {
        this.updateStatus('loadLicenseOptions', 'loading');
        lastValueFrom(
            this.userQualificationsApiService
                .loadLicenseOptions(companyId)
                .pipe(map((res) => res.data))
        )
            .then((data) => {
                this.updateStatus('loadLicenseOptions', 'success');
                this.licenseOptions$.next(data);
            })
            .catch(() => {
                this.updateStatus('loadLicenseOptions', 'error');
            });
    }

    loadLicenses(userid: string): void {
        this.licenses$.next([]);
        this.updateStatus('loadLicenses', 'loading');
        this.userState.getAspNetUser().then((user) => {
            const companyUniqueId = user?.companyUniqueID;
            if (companyUniqueId) {
                lastValueFrom(
                    this.userQualificationsApiService.loadUserQualifications(
                        companyUniqueId,
                        userid,
                        'License'
                    )
                )
                    .then((res) => {
                        this.updateStatus('loadLicenses', 'success');
                        this.licenses$.next(res.data);
                    })
                    .catch(() => {
                        this.updateStatus('loadLicenses', 'error');
                    });
            }
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    saveLicenses(formData: FormData) {
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
            ).then((res) => {
                if (res.success) {
                    this.refresh();
                    return Promise.resolve();
                }
                return Promise.reject(res.errors);
            });
        });
    }

    deleteSpecialLicense(config: UserQualificationListItem) {
        return lastValueFrom(
            this.userQualificationsApiService.deleteUserQualification(config)
        ).then((res) => {
            if (res.success) {
                this.refresh();
                return Promise.resolve();
            }
            return Promise.reject(res.error);
        });
    }
    private updateStatus(
        key: 'loadQualifications' | 'loadLicenses' | 'loadLicenseOptions',
        status: UIStatus
    ): void {
        this.status$.next({
            ...this.status$.getValue(),
            [key]: status,
        });
    }
}
