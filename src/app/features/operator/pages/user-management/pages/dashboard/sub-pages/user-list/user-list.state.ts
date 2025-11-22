import { Injectable, inject } from '@angular/core';
import {
    UserManagementApiService,
    UserState,
    UserListItem,
    UserDetailsConfig,
    UserApiService,
    UIState,
    ErrorDialogMessages,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, map, switchMap, tap } from 'rxjs';

@Injectable()
export class UserListState {
    userState = inject(UserState);
    uiState = inject(UIState);
    userManagementApiService = inject(UserManagementApiService);
    userApiService = inject(UserApiService);

    users$ = new BehaviorSubject<UserListItem[]>([]);
    status$ = new BehaviorSubject<'idle' | 'loading' | 'error' | 'success'>(
        'idle'
    );

    modals$ = new BehaviorSubject<{
        addNewUser: {
            isOpen: boolean;
        };
        deleteUser: {
            isOpen: boolean;
            context?: UserListItem;
            isEmployee?: boolean;
        };
        restoreUser: {
            isOpen: boolean;
            context?: UserListItem;
        };
    }>({
        addNewUser: {
            isOpen: false,
        },
        deleteUser: {
            isOpen: false,
        },
        restoreUser: {
            isOpen: false,
        },
    });

    config$ = new BehaviorSubject<{
        showInActive: boolean;
        refreshTriggered: number;
    }>({
        showInActive: false,
        refreshTriggered: 0,
    });

    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        this.config$.subscribe((config) => {
            this.loadUsers(config.showInActive);
        });
    }

    loadUsers(showInActive: boolean): Promise<void> {
        this.users$.next([]);
        this.status$.next('loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (user?.companyUniqueID) {
                    return lastValueFrom(
                        this.userManagementApiService.getUserList({
                            companyId: user?.companyUniqueID,
                            showInActive: showInActive,
                        })
                    ).then((res) => {
                        return Promise.resolve(res.data);
                    });
                }
                return Promise.reject('missing agent information');
            })
            .then((users) => {
                this.status$.next('success');
                this.users$.next(users);
                return Promise.resolve();
            })
            .catch((error) => {
                this.uiState.openErrorDialog({
                    title: error.errorTitle
                        ? error.errorTitle
                        : ErrorDialogMessages.userManagement.loadUserError
                              .title,
                    description:
                        error?.errors &&
                        Array.isArray(error.errors) &&
                        error.errors.length > 0
                            ? error.errors[0]
                            : ErrorDialogMessages.userManagement.loadUserError
                                  .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .loadUserError.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                this.status$.next('error');
                // swallow error
                return Promise.resolve();
            });
    }

    addNewUser(newUser: UserDetailsConfig) {
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.b2CUserId || !user.companyUniqueID) {
                    return Promise.reject('user is undefined');
                }
                return lastValueFrom(
                    this.userApiService
                        .createB2CUser({
                            id: '',
                            userName: '',
                            password: this.generateRandomPassword(), // what should this field be?
                            email: newUser.email,
                            secondaryEmail: '',
                            firstName: newUser.firstName,
                            lastName: newUser.lastName,
                            stateName: '',
                            countryName: '',
                            isActive: true,
                            companyUniqueId: user.companyUniqueID ?? '',
                        })
                        .pipe(
                            map((res) => {
                                return res.data?.id;
                            }),
                            switchMap((newlyCreaterUser) => {
                                return this.userManagementApiService.saveUserDetail(
                                    {
                                        ...newUser,
                                        userId: newlyCreaterUser ?? '',
                                    }
                                );
                            }),
                            tap(() => {
                                this.refresh();
                            })
                        )
                ).catch((error) => {
                    return Promise.reject(error);
                });
            })
            .then(() => {
                this.userApiService
                    .sendForgotPasswordEmail(newUser.email)
                    .subscribe(() => {});
                return Promise.resolve();
            });
    }

    deleteUser(userId: string, isEligibleForRehire: boolean) {
        this.status$.next('loading');
        return lastValueFrom(
            this.userApiService.deleteAspNetUser(userId, isEligibleForRehire)
        ).then((res) => {
            if (!res.success) {
                this.status$.next('error');
                return Promise.reject(res.error);
            }
            this.status$.next('success');
            return Promise.resolve();
        });
    }

    restoreUser(userId: string) {
        this.status$.next('loading');
        return lastValueFrom(
            this.userApiService.restoreAspNetUser(userId)
        ).then((res) => {
            if (!res.success) {
                this.status$.next('error');
                return Promise.reject(res.error);
            }
            this.status$.next('success');
            return Promise.resolve();
        });
    }

    openAddNewUserModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            addNewUser: {
                isOpen: true,
            },
        });
    }

    closeAddNewUserModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            addNewUser: {
                isOpen: false,
            },
        });
    }

    openDeleteUserModal(context: UserListItem) {
        // Get the context for the user role
        this.status$.next('loading');
        return lastValueFrom(
            this.userApiService.getAllUserCruiseCodeAuthRoles(context.userId)
        ).then((res) => {
            if (!res.success) {
                this.status$.next('error');
                return Promise.reject(res.error);
            } else {
                const isEmployee = res.data.find((x) => x === 'Employee')
                    ? true
                    : false;
                this.modals$.next({
                    ...this.modals$.getValue(),
                    deleteUser: {
                        isOpen: true,
                        context,
                        isEmployee,
                    },
                });

                this.status$.next('success');
                return Promise.resolve();
            }
        });
    }

    closeDeleteUserModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            deleteUser: {
                isOpen: false,
            },
        });
    }

    openRestoreUserModal(context: UserListItem): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            restoreUser: {
                isOpen: true,
                context,
            },
        });
    }

    closeRestoreUserModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            restoreUser: {
                isOpen: false,
            },
        });
    }

    setFilter(showInActive: boolean): void {
        this.config$.next({
            ...this.config$.getValue(),
            showInActive,
        });
    }

    refresh(): void {
        this.config$.next({
            ...this.config$.getValue(),
            refreshTriggered: new Date().getTime(),
        });
    }

    generateRandomPassword() {
        const charset =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';
        const minLength = 8;

        let password = '';

        while (password.length < minLength) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        return password;
    }
}
