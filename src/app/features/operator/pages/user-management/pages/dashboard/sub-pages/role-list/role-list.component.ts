import { CommonModule, KeyValue, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, combineLatest, filter, map, takeUntil } from 'rxjs';
import {
    ConfirmationDialogMessages,
    Features,
    Role,
    UIState,
    UserState,
    formatRoleBasedFeatureControls,
} from '@app/core';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { RoleListState, UIState as RoleUIState } from './state';
import {
    CreateRoleModalComponent,
    UpdateRoleModalComponent,
} from './components';
import { PermissionDirective } from '@app/shared';
import { AccordionModule } from 'primeng/accordion';

@Component({
    standalone: true,
    selector: 'app-role-list',
    templateUrl: './role-list.component.html',
    styleUrls: ['./role-list.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        DividerModule,
        TooltipModule,
        AccordionModule,
        PermissionDirective,

        // Modals
        CreateRoleModalComponent,
        UpdateRoleModalComponent,
    ],
    providers: [RoleListState, RoleUIState, TitleCasePipe],
})
export class RoleListComponent {
    titleCasePipe = inject(TitleCasePipe);
    activatedRoute = inject(ActivatedRoute);
    router = inject(Router);
    roleListState = inject(RoleListState);
    userState = inject(UserState);
    roleUIState = inject(RoleUIState);
    uiState = inject(UIState);
    roles$ = this.roleListState.roles$;
    roleBasedPermissions$ = this.roleListState.rolePermissions$;
    appFeatures = Features;
    features$ = combineLatest([
        this.roleListState.features$.pipe(
            filter((globalFeatures) => !!globalFeatures)
        ),
        this.roleBasedPermissions$.pipe(
            filter((roleBasedFeatures) => !!roleBasedFeatures?.permissions)
        ),
    ]).pipe(
        map(([globalFeatures, roleBasedFeatures]) => {
            if (globalFeatures && roleBasedFeatures?.permissions) {
                return formatRoleBasedFeatureControls(
                    globalFeatures,
                    roleBasedFeatures.permissions
                );
            } else {
                return {};
            }
        })
    );
    roleId$ = this.activatedRoute.queryParamMap.pipe(
        map((paramMap) => paramMap.get('role'))
    );
    role: Role | null | undefined = undefined;

    private isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.roleListState.fetchFeatureFlags();
        this.roleListState.fetchAllAvailableRoles();
        this.roleListState.fetchAllAvailableAuthRoles();
        this.roles$
            .pipe(
                filter((roles) => roles?.length > 0),
                takeUntil(this.isDestroyed$)
            )
            .subscribe((roles) => {
                this.roleId$
                    .pipe(takeUntil(this.isDestroyed$))
                    .subscribe((roleId) => {
                        if (roleId) {
                            this.role = roles.find(
                                (role) => role.id === roleId
                            );
                            this.roleListState.fetchRolePermission(roleId);
                        } else {
                            this.router.navigate(
                                ['/operator/user-management/dashboard/roles'],
                                {
                                    queryParams: { role: roles[0].id },
                                }
                            );
                        }
                    });
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    toggleCategory(
        categoryId: string,
        isActive: boolean,
        event: MouseEvent
    ): void {
        if (event) {
            event.stopPropagation();
        }
        this.userState.getAspNetUser().then((user) => {
            if (!this.role?.id || !user?.companyUniqueID) {
                return;
            }
            this.roleListState.addOrUpdateFeature({
                id: '', // this is not in use, we're using the cruiseCodeGlobalFeatureId instead
                aspNetRoleId: this.role.id,
                companyUniqueId: user.companyUniqueID,
                cruiseCodeGlobalFeatureId: categoryId,
                isActive,
            });
        });
    }

    togglePage(pageId: string, isActive: boolean): void {
        this.userState.getAspNetUser().then((user) => {
            if (!this.role?.id || !user?.companyUniqueID) {
                return;
            }
            this.roleListState.addOrUpdatePageForFeature({
                id: '', // this is not in use, we're using the cruiseCodeGlobalPageId instead
                aspNetRoleId: this.role.id,
                companyUniqueId: user.companyUniqueID,
                cruiseCodeGlobalPageId: pageId,
                isActive,
            });
        });
    }

    toggleFeature(pageFeatureId: string, isActive: boolean): void {
        this.userState.getAspNetUser().then((user) => {
            if (!this.role?.id || !user?.companyUniqueID) {
                return;
            }
            this.roleListState.addOrUpdateFeatureForPage({
                id: '', // this is not in use, we're using the cruiseCodeGlobalPageFeatureId instead
                aspNetRoleId: this.role.id,
                companyUniqueId: user.companyUniqueID,
                cruiseCodeGlobalPageFeatureId: pageFeatureId,
                isActive,
            });
        });
    }

    addNewRole(): void {
        this.roleUIState.openCreateRoleModal();
    }

    editRole(): void {
        if (!this.role) {
            return;
        }
        this.roleUIState.openUpdateRoleModal(this.role);
    }

    deleteRole(): void {
        if (!this.role) {
            return;
        }
        this.uiState.openConfirmationDialog({
            title: `${
                ConfirmationDialogMessages.userManagement.deleteRole.title
            } - ${this.titleCasePipe.transform(this.role.name)}`,
            description:
                ConfirmationDialogMessages.userManagement.deleteRole
                    .description,
            buttons: [
                {
                    text: ConfirmationDialogMessages.userManagement.deleteRole
                        .buttons.cancel,
                    isPrimary: false,
                    onClick: () => {},
                },
                {
                    text: ConfirmationDialogMessages.userManagement.deleteRole
                        .buttons.delete,
                    isPrimary: true,
                    onClick: () => {
                        if (this.role?.id) {
                            this.roleListState
                                .deleteRole(this.role.id)
                                .then(() => {
                                    this.router.navigate([
                                        '/operator/user-management/dashboard/roles',
                                    ]);
                                });
                        }
                    },
                },
            ],
        });
    }

    featureFlagsTrackBy(
        _index: number,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item: any | KeyValue<string, { id: string }>
    ): string {
        return `${item.value.id}+${_index}`;
    }
}
