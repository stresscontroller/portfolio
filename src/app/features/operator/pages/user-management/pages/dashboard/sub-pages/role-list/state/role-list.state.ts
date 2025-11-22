import { Injectable, inject } from '@angular/core';
import {
    Feature,
    UIState,
    ApiPermissionsControlService,
    UserState,
    RoleLinkingFeatureInsert,
    RoleLinkingPageInsert,
    RoleLinkingPageFeatureInsert,
    ErrorDialogMessages,
    Role,
    AuthRole,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, map } from 'rxjs';

@Injectable()
export class RoleListState {
    apiPermissionsControlService = inject(ApiPermissionsControlService);
    uiState = inject(UIState);
    userState = inject(UserState);
    features$ = new BehaviorSubject<Feature[]>([]);
    authRoles$ = new BehaviorSubject<AuthRole[]>([]);
    roles$ = new BehaviorSubject<Role[]>([]);
    rolePermissions$ = new BehaviorSubject<
        | {
              roleId: string;
              permissions: Feature[];
          }
        | undefined
    >(undefined);

    fetchAllAvailableRoles(): Promise<Role[]> {
        return this.userState.getAspNetUser().then((user) => {
            if (user?.companyUniqueID) {
                return lastValueFrom(
                    this.apiPermissionsControlService.getAllAvailableRoles(
                        user.companyUniqueID
                    )
                ).then((res) => {
                    this.roles$.next(
                        res.data.sort((a, b) => (a.name > b.name ? 1 : -1))
                    );
                    return this.roles$.getValue();
                });
            }
            return [];
        });
    }

    fetchAllAvailableAuthRoles(): Promise<AuthRole[]> {
        return this.userState.getAspNetUser().then((user) => {
            if (user?.companyUniqueID) {
                return lastValueFrom(
                    this.apiPermissionsControlService.getAuthRoles(
                        user.companyUniqueID
                    )
                ).then((res) => {
                    this.authRoles$.next(
                        res.data.sort((a, b) => (a.name > b.name ? 1 : -1))
                    );
                    return this.authRoles$.getValue();
                });
            }
            return [];
        });
    }

    fetchFeatureFlags(): void {
        this.uiState.showLoadingIndicator();
        lastValueFrom(
            this.apiPermissionsControlService.getGlobalFeatureOverview()
        )
            .then((res) => {
                this.features$.next(
                    res.data
                        ?.sort((a, b) => (a.name > b.name ? 1 : -1))
                        .map((feat) => {
                            return {
                                ...feat,
                                pages: feat.pages
                                    .sort((a, b) => (a.name > b.name ? 1 : -1))
                                    .map((page) => {
                                        return {
                                            ...page,
                                            pageFeatures:
                                                page.pageFeatures?.sort(
                                                    (a, b) =>
                                                        a.name > b.name ? 1 : -1
                                                ) || [],
                                        };
                                    }),
                            };
                        })
                );
                this.uiState.hideLoadingIndicator();
            })
            .catch((error) => {
                this.uiState.hideLoadingIndicator();
                this.uiState.openErrorDialog({
                    title: error?.errorTitle
                        ? error.errorTitle
                        : ErrorDialogMessages.userManagement.fetchFeatureFlags
                              .title,
                    description:
                        error?.errors &&
                        Array.isArray(error.errors) &&
                        error.errors.length > 0
                            ? error.errors[0]
                            : ErrorDialogMessages.userManagement
                                  .fetchFeatureFlags.description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .fetchFeatureFlags.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                // close dialog
                            },
                        },
                    ],
                });
            });
    }

    fetchRolePermission(roleId: string): void {
        this.uiState.showLoadingIndicator();
        this.rolePermissions$.next(undefined);
        this.userState.getAspNetUser().then((user) => {
            if (user?.companyUniqueID) {
                lastValueFrom(
                    this.apiPermissionsControlService.getRolePermissions(
                        user.companyUniqueID,
                        roleId
                    )
                )
                    .then((res) => {
                        this.rolePermissions$.next({
                            roleId: roleId,
                            permissions: res,
                        });
                        this.uiState.hideLoadingIndicator();
                    })
                    .catch((error) => {
                        this.uiState.hideLoadingIndicator();
                        this.uiState.openErrorDialog({
                            title: error?.errorTitle
                                ? error.errorTitle
                                : ErrorDialogMessages.userManagement
                                      .fetchFeatureFlags.title,
                            description:
                                error?.errors &&
                                Array.isArray(error.errors) &&
                                error.errors.length > 0
                                    ? error.errors[0]
                                    : ErrorDialogMessages.userManagement
                                          .fetchFeatureFlags.description,
                            buttons: [
                                {
                                    text: ErrorDialogMessages.userManagement
                                        .fetchFeatureFlags.buttons.close,
                                    isPrimary: true,
                                    onClick: () => {
                                        // close dialog
                                    },
                                },
                            ],
                        });
                    });
            }
        });
    }

    fetchAssociatedAuthRole(roleId: string): Promise<AuthRole[]> {
        return lastValueFrom(
            this.apiPermissionsControlService
                .getAuthRolesForRole(roleId)
                .pipe(map((res) => res?.data))
        );
    }

    updateAuthRole(roleId: string, authRoles: string[]): Promise<void> {
        return lastValueFrom(
            this.apiPermissionsControlService.updateAuthRolesForRole(
                roleId,
                authRoles
            )
        ).then((res) => {
            if (res.success) {
                return Promise.resolve();
            }
            return Promise.reject(res.error);
        });
    }

    addOrUpdateFeature(newFeature: RoleLinkingFeatureInsert): Promise<void> {
        this.uiState.showLoadingIndicator();
        return lastValueFrom(
            this.apiPermissionsControlService.updateInsertRoleBasedFeature(
                newFeature
            )
        )
            .then(() => {
                return this.fetchRolePermission(newFeature.aspNetRoleId);
            })
            .then(() => {
                this.uiState.hideLoadingIndicator();
                return Promise.resolve();
            })
            .catch((error) => {
                this.uiState.hideLoadingIndicator();
                this.uiState.openErrorDialog({
                    title: error?.errorTitle
                        ? error.errorTitle
                        : ErrorDialogMessages.userManagement.updateFeature
                              .title,
                    description:
                        error?.errors &&
                        Array.isArray(error.errors) &&
                        error.errors.length > 0
                            ? error.errors[0]
                            : ErrorDialogMessages.userManagement.updateFeature
                                  .description,
                    buttons: [
                        {
                            onClick: () => {},
                            text: ErrorDialogMessages.userManagement
                                .updateFeature.buttons.close,
                            isPrimary: true,
                        },
                    ],
                });
            });
    }

    addOrUpdatePageForFeature(
        pageFeaturesItem: RoleLinkingPageInsert
    ): Promise<void> {
        this.uiState.showLoadingIndicator();
        return lastValueFrom(
            this.apiPermissionsControlService.updateInsertRoleBasedPage(
                pageFeaturesItem
            )
        )
            .then(() => {
                return this.fetchRolePermission(pageFeaturesItem.aspNetRoleId);
            })
            .then(() => {
                this.uiState.hideLoadingIndicator();
                return Promise.resolve();
            })
            .catch((error) => {
                this.uiState.hideLoadingIndicator();
                this.uiState.openErrorDialog({
                    title: error?.errorTitle
                        ? error.errorTitle
                        : ErrorDialogMessages.userManagement.updatePage.title,
                    description:
                        error?.errors &&
                        Array.isArray(error.errors) &&
                        error.errors.length > 0
                            ? error.errors[0]
                            : ErrorDialogMessages.userManagement.updatePage
                                  .description,
                    buttons: [
                        {
                            onClick: () => {},
                            text: ErrorDialogMessages.userManagement.updatePage
                                .buttons.close,
                            isPrimary: true,
                        },
                    ],
                });
            });
    }

    addOrUpdateFeatureForPage(
        newPageFeature: RoleLinkingPageFeatureInsert
    ): Promise<void> {
        this.uiState.showLoadingIndicator();
        return lastValueFrom(
            this.apiPermissionsControlService.updateInsertRoleBasedPageFeature(
                newPageFeature
            )
        )
            .then(() => {
                return this.fetchRolePermission(newPageFeature.aspNetRoleId);
            })
            .then(() => {
                this.uiState.hideLoadingIndicator();
                return Promise.resolve();
            })
            .catch((error) => {
                this.uiState.hideLoadingIndicator();
                this.uiState.openErrorDialog({
                    title: error?.errorTitle
                        ? error.errorTitle
                        : ErrorDialogMessages.userManagement.updatePageFeature
                              .title,
                    description:
                        error?.errors &&
                        Array.isArray(error.errors) &&
                        error.errors.length > 0
                            ? error.errors[0]
                            : ErrorDialogMessages.userManagement
                                  .updatePageFeature.description,
                    buttons: [
                        {
                            onClick: () => {},
                            text: ErrorDialogMessages.userManagement
                                .updatePageFeature.buttons.close,
                            isPrimary: true,
                        },
                    ],
                });
            });
    }

    createNewRole(roleName: string): Promise<Role> {
        return this.userState.getAspNetUser().then((user) => {
            if (user?.companyUniqueID) {
                return lastValueFrom(
                    this.apiPermissionsControlService.createRole(
                        roleName,
                        user.companyUniqueID
                    )
                ).then((res) => {
                    return Promise.resolve(res.data);
                });
            }
            return Promise.reject('missing companyUniqueId');
        });
    }

    deleteRole(roleId: string): Promise<void> {
        this.uiState.showLoadingIndicator();
        return lastValueFrom(
            this.apiPermissionsControlService.deleteRole(roleId)
        )
            .then(() => {
                return this.fetchAllAvailableRoles();
            })
            .then(() => {
                this.uiState.hideLoadingIndicator();
                return Promise.resolve();
            })
            .catch(() => {
                this.uiState.hideLoadingIndicator();
                this.uiState.openErrorDialog({
                    title: ErrorDialogMessages.userManagement.deleteRole.title,
                    description:
                        ErrorDialogMessages.userManagement.deleteRole
                            .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement.deleteRole
                                .buttons.close,
                            isPrimary: true,
                            onClick: () => {},
                        },
                    ],
                });
            });
    }

    copyFeaturesFromRole(roles: {
        copyFrom: string;
        copyTo: string;
    }): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (user?.companyUniqueID) {
                return lastValueFrom(
                    this.apiPermissionsControlService.copyFeatureControlsFromRole(
                        user.companyUniqueID,
                        roles.copyFrom,
                        roles.copyTo
                    )
                ).then(() => {
                    return Promise.resolve();
                });
            }
            return Promise.reject('missing companyUniqueId');
        });
    }

    updateRoleDetails(role: Role): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (user?.companyUniqueID) {
                return lastValueFrom(
                    this.apiPermissionsControlService.updateRole({
                        ...role,
                        companyUniqueId: user.companyUniqueID,
                    })
                ).then(() => {
                    return Promise.resolve();
                });
            }
            return Promise.reject('missing companyUniqueId');
        });
    }
}
