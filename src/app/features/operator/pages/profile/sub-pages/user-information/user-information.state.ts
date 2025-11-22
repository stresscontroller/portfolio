import { Injectable, inject } from '@angular/core';
import {
    UserManagementApiService,
    UserDetailsConfig,
    UserApiService,
    AuthRole,
    ApiPermissionsControlService,
    AgentApiService,
    UIStatus,
    UserState,
    UserDetails,
} from '@app/core';
import {
    BehaviorSubject,
    filter,
    lastValueFrom,
    map,
    switchMap,
    tap,
} from 'rxjs';

@Injectable()
export class UserInformationState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);
    apiPermissionsControlService = inject(ApiPermissionsControlService);
    agentApiService = inject(AgentApiService);
    userApiService = inject(UserApiService);

    userDetails$ = new BehaviorSubject<UserDetails | undefined>(undefined);
    status$ = new BehaviorSubject<{
        loadProfile: UIStatus;
        saveProfile: UIStatus;
        uploadProfilePhoto: UIStatus;
    }>({
        loadProfile: 'idle',
        saveProfile: 'idle',
        uploadProfilePhoto: 'idle',
    });

    associatedAuthRoles: Record<string, AuthRole[]> = {};

    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;
    init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.userState.aspNetUser$
            .pipe(
                map((user) => user?.id),
                tap(() => {
                    this.userDetails$.next(undefined);
                }),
                filter((userId) => !!userId),
                switchMap((userId) =>
                    this.refreshTriggered$.pipe(
                        switchMap(() => {
                            this.updateStatus('loadProfile', 'loading');
                            return this.userManagementApiService
                                .getUserDetail(userId!)
                                .pipe(map((res) => res?.data));
                        })
                    )
                )
            )
            .subscribe((user) => {
                this.updateStatus('loadProfile', 'idle');
                this.userDetails$.next(user);
            });
    }
    getAssociatedAuthRole(roleId: string): Promise<AuthRole[]> {
        if (roleId in this.associatedAuthRoles) {
            return Promise.resolve(this.associatedAuthRoles[roleId]);
        }
        return lastValueFrom(
            this.apiPermissionsControlService.getAuthRolesForRole(roleId).pipe(
                map((res) => res?.data),
                tap((data) => {
                    this.associatedAuthRoles[roleId] = data;
                })
            )
        );
    }

    linkUserToAgent(partnerId: number): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            const userId = user?.id;
            if (!userId) {
                return Promise.reject('no edit user id');
            }
            return lastValueFrom(
                this.agentApiService.linkUserToAgent(userId, partnerId)
            ).then((res) => {
                if (res.success) {
                    return Promise.resolve();
                }
                return Promise.reject(res.errors);
            });
        });
    }

    unlinkUserFromAgent(partnerId: number): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            const userId = user?.id;
            if (!userId) {
                return Promise.reject('no edit user id');
            }
            return lastValueFrom(
                this.agentApiService.unlinkUserFromAgent(userId, partnerId)
            ).then((res) => {
                if (res.success) {
                    return Promise.resolve();
                }
                return Promise.reject(res.errors);
            });
        });
    }

    saveUserInfo(userDetails: UserDetailsConfig): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            const userId = user?.id;
            if (!userId) {
                return Promise.reject('no edit user id');
            }
            this.updateStatus('saveProfile', 'loading');
            return lastValueFrom(
                this.userManagementApiService.saveUserDetail({
                    ...userDetails,
                    userId,
                })
            )
                .then((res) => {
                    if (!res.success) {
                        throw res;
                    }
                    this.updateStatus('saveProfile', 'success');

                    // reload profile info on the root level
                    return this.userState.loadAspNetUser();
                })
                .then(() => {
                    return Promise.resolve();
                })
                .catch((error) => {
                    this.updateStatus('saveProfile', 'error');
                    return Promise.reject(error);
                });
        });
    }

    saveUserProfilePhoto(imageFile: File): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            const userId = user?.id;
            this.updateStatus('uploadProfilePhoto', 'loading');
            if (!userId) {
                return Promise.reject('no edit user id');
            }
            const formData = new FormData();
            formData.append('File', imageFile, imageFile.name);
            formData.append('PhotoFileName', imageFile.name);
            formData.append('PhotoPath', '/test');
            formData.append('CreatedBy', new Date().toISOString());
            formData.append('UserId', userId);

            return lastValueFrom(
                this.userManagementApiService.saveUserProfilePhoto(formData)
            )
                .then((res) => {
                    if (!res.success) {
                        return Promise.reject(res.error);
                    }
                    // reload root profile
                    return this.userState.loadAspNetUser();
                })
                .then(() => {
                    this.updateStatus('uploadProfilePhoto', 'success');
                    return Promise.resolve();
                })
                .catch((error) => {
                    this.updateStatus('uploadProfilePhoto', 'error');
                    return Promise.reject(error);
                });
        });
    }

    private updateStatus(
        statusKey: 'loadProfile' | 'saveProfile' | 'uploadProfilePhoto',
        status: UIStatus
    ): void {
        this.status$.next({
            ...this.status$.getValue(),
            [statusKey]: status,
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }
}
