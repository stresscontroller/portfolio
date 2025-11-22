import { Injectable, inject } from '@angular/core';
import {
    UserManagementApiService,
    UserDetailsConfig,
    UserApiService,
    AuthRole,
    ApiPermissionsControlService,
    AgentApiService,
    UIStatus,
} from '@app/core';
import {
    BehaviorSubject,
    filter,
    lastValueFrom,
    map,
    of,
    switchMap,
    tap,
} from 'rxjs';
import { UserEditState } from '../../state';

@Injectable()
export class UserInformationState {
    userManagementApiService = inject(UserManagementApiService);
    apiPermissionsControlService = inject(ApiPermissionsControlService);
    agentApiService = inject(AgentApiService);
    userEditState = inject(UserEditState);
    userApiService = inject(UserApiService);
    primaryAgent$ = new BehaviorSubject<boolean | undefined>(undefined);
    initialized = false;
    private refreshTriggered$ = new BehaviorSubject<number>(0);

    init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.userEditState.userDetails$
            .pipe(
                tap(() => {
                    this.primaryAgent$.next(false);
                }),
                filter((userDetails) => userDetails !== undefined),
                switchMap((userDetails) => {
                    if (userDetails === undefined) {
                        return of({
                            userDetails: undefined,
                            agentDetails: undefined,
                        });
                    }
                    return this.refreshTriggered$.pipe(
                        switchMap(() =>
                            this.agentApiService
                                .getAgentDetails(userDetails.partnerId!)
                                .pipe(
                                    map((res) => ({
                                        userDetails,
                                        agentDetails: res?.data,
                                    }))
                                )
                        )
                    );
                })
            )
            .subscribe(({ userDetails, agentDetails }) => {
                if (userDetails && agentDetails) {
                    this.primaryAgent$.next(
                        agentDetails.email === userDetails.email
                    );
                } else {
                    this.primaryAgent$.next(false);
                }
            });
    }

    status$ = new BehaviorSubject<{
        saveProfile: UIStatus;
        uploadProfilePhoto: UIStatus;
        resetPassword: UIStatus;
    }>({
        saveProfile: 'idle',
        uploadProfilePhoto: 'idle',
        resetPassword: 'idle',
    });

    associatedAuthRoles: Record<string, AuthRole[]> = {};

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
        const userId = this.userEditState.editUserId$.getValue();
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
    }

    unlinkUserFromAgent(partnerId: number): Promise<void> {
        const userId = this.userEditState.editUserId$.getValue();
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
    }

    saveUserInfo(userDetails: UserDetailsConfig): Promise<void> {
        this.updateStatus('saveProfile', 'loading');
        const userId = this.userEditState.editUserId$.getValue();
        if (!userId) {
            return Promise.reject('no edit user id');
        }
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
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('saveProfile', 'error');
                return Promise.reject(error);
            });
    }

    saveUserProfilePhoto(imageFile: File): Promise<void> {
        this.updateStatus('uploadProfilePhoto', 'loading');
        const editUserId = this.userEditState.editUserId$.getValue();
        const editUserDetails = this.userEditState.userDetails$.getValue();
        if (!editUserId) {
            return Promise.reject('no edit user id');
        }
        if (!editUserDetails) {
            return Promise.reject('no role id');
        }
        const formData = new FormData();
        formData.append('File', imageFile, imageFile.name);
        formData.append('PhotoFileName', imageFile.name);
        formData.append('PhotoPath', '/test');
        formData.append('CreatedBy', new Date().toISOString());
        formData.append('UserId', editUserId);

        return lastValueFrom(
            this.userManagementApiService.saveUserProfilePhoto(formData)
        )
            .then((res) => {
                if (!res.success) {
                    throw res;
                }
                this.updateStatus('uploadProfilePhoto', 'success');
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('uploadProfilePhoto', 'error');
                return Promise.reject(error);
            });
    }

    resetPassword() {
        const editUserDetails = this.userEditState.userDetails$.getValue();
        this.updateStatus('resetPassword', 'loading');
        return lastValueFrom(
            this.userApiService.sendForgotPasswordEmail(
                editUserDetails?.email || ''
            )
        )
            .then(() => {
                this.updateStatus('resetPassword', 'success');
                return Promise.resolve();
            })
            .catch(() => {
                this.updateStatus('resetPassword', 'error');
            });
    }
    private updateStatus(
        statusKey: 'saveProfile' | 'uploadProfilePhoto' | 'resetPassword',
        status: UIStatus
    ): void {
        this.status$.next({
            ...this.status$.getValue(),
            [statusKey]: status,
        });
    }
    refresh(): void {
        this.userEditState.refresh();
    }
}
