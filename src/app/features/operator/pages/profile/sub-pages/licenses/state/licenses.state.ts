import { Injectable, inject } from '@angular/core';
import {
    UserState,
    UserQualificationsApiService,
    UserQualificationListItem,
    UserQualificationConfig,
    Qualification,
    UIStatus,
    LicenseOptions,
} from '@app/core';
import {
    BehaviorSubject,
    distinctUntilChanged,
    lastValueFrom,
    map,
    of,
    switchMap,
    tap,
} from 'rxjs';
import { UIState } from './ui.state';

@Injectable()
export class SpecialLicensesState {
    userState = inject(UserState);
    uiState = inject(UIState);
    userQualificationsApiService = inject(UserQualificationsApiService);

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
        this.userState.aspNetUser$
            .pipe(
                distinctUntilChanged(),
                switchMap((user) => {
                    const userId = user?.id;
                    if (userId && user.companyUniqueID) {
                        this.loadQualifications();
                        this.loadLicenseOptions();
                        return this.refreshTriggered$.pipe(
                            tap(() => {
                                this.loadLicenses();
                            })
                        );
                    } else {
                        this.licenses$.next([]);
                        return of([]);
                    }
                })
            )
            .subscribe();
    }

    loadQualifications(): void {
        this.updateStatus('loadQualifications', 'loading');
        this.qualifications$.next([]);
        this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.companyUniqueID) {
                    return Promise.reject('missing user information');
                }
                return lastValueFrom(
                    this.userQualificationsApiService
                        .loadQualificationData(user.companyUniqueID)
                        .pipe(map((res) => res.data))
                );
            })

            .then((data) => {
                this.updateStatus('loadQualifications', 'success');
                this.qualifications$.next(data);
            })
            .catch(() => {
                this.updateStatus('loadQualifications', 'error');
            });
    }

    loadLicenseOptions(): void {
        this.updateStatus('loadLicenseOptions', 'loading');
        this.licenseOptions$.next([]);
        this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.companyUniqueID) {
                    return Promise.reject('missing user information');
                }
                return lastValueFrom(
                    this.userQualificationsApiService
                        .loadLicenseOptions(user.companyUniqueID)
                        .pipe(map((res) => res.data))
                );
            })
            .then((data) => {
                this.updateStatus('loadLicenseOptions', 'success');
                this.licenseOptions$.next(data);
            })
            .catch(() => {
                this.updateStatus('loadLicenseOptions', 'error');
            });
    }

    loadLicenses(): void {
        this.licenses$.next([]);
        this.updateStatus('loadLicenses', 'loading');
        this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.companyUniqueID || !user.id) {
                    return Promise.reject('missing user information');
                }
                return lastValueFrom(
                    this.userQualificationsApiService.loadUserQualifications(
                        user.companyUniqueID,
                        user.id,
                        'License'
                    )
                );
            })
            .then((res) => {
                this.updateStatus('loadLicenses', 'success');
                this.licenses$.next(res.data);
            })
            .catch(() => {
                this.updateStatus('loadLicenses', 'error');
            });
    }

    saveLicenses(config: UserQualificationConfig): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user || !user.id || !user.companyUniqueID) {
                return Promise.reject('missing user information');
            }
            return lastValueFrom(
                this.userQualificationsApiService.saveUserQualifications({
                    ...config,
                    userid: user.id,
                    companyUniqueId: user.companyUniqueID,
                })
            ).then((res) => {
                if (res.success) {
                    return Promise.resolve();
                }
                return Promise.reject(res.error);
            });
        });
    }

    deleteSpecialLicense(config: UserQualificationListItem): Promise<void> {
        return lastValueFrom(
            this.userQualificationsApiService.deleteUserQualification(config)
        ).then((res) => {
            if (res.success) {
                return Promise.resolve();
            }
            return Promise.reject(res.error);
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
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
