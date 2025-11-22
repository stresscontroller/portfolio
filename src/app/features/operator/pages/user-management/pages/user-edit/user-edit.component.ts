import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserEditState } from './state';
import { Observable, Subject, combineLatest, map, takeUntil } from 'rxjs';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { Features, UserState, checkPageAccess } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-user-edit',
    templateUrl: './user-edit.component.html',
    styleUrls: ['./user-edit.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
    providers: [UserEditState],
})
export class UserEditComponent {
    activatedRoute = inject(ActivatedRoute);
    userEditState = inject(UserEditState);
    userState = inject(UserState);
    features = Features;
    userDetails$ = this.userEditState.userDetails$;
    isLoadingUserDetails$ = this.userEditState.isLoadingUserDetails$;
    editUserFeatures = Object.values(Features.userManagementEdit.pages).map(
        (page) => ({
            feature: Features.userManagementEdit.name,
            page: page.name,
        })
    );
    inventoryNavOptions$: Observable<
        {
            displayName: string;
            path: string;
        }[]
    > = combineLatest([this.userState.controls$, this.userDetails$]).pipe(
        map(([featureControls, userDetails]) => {
            if (!userDetails?.isEmployee) {
                return [];
            }
            return [
                ...(checkPageAccess(
                    featureControls,
                    Features.userManagementEdit.name,
                    Features.userManagementEdit.pages.userInformation.name
                )
                    ? [
                          {
                              displayName: 'User Information',
                              path: './user-information',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.userManagementEdit.name,
                    Features.userManagementEdit.pages.payroll.name
                )
                    ? [
                          {
                              displayName: 'Payroll',
                              path: './payroll',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.userManagementEdit.name,
                    Features.userManagementEdit.pages.certifications.name
                )
                    ? [
                          {
                              displayName: 'Certifications',
                              path: './certifications',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.userManagementEdit.name,
                    Features.userManagementEdit.pages.specialLicenses.name
                )
                    ? [
                          {
                              displayName: 'Special Licenses',
                              path: './licenses',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.userManagementEdit.name,
                    Features.userManagementEdit.pages.training.name
                )
                    ? [
                          {
                              displayName: 'Training',
                              path: './training',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.userManagementEdit.name,
                    Features.userManagementEdit.pages.housing.name
                )
                    ? [
                          {
                              displayName: 'Housing',
                              path: './housing',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.userManagementEdit.name,
                    Features.userManagementEdit.pages.evaluations.name
                )
                    ? [
                          {
                              displayName: 'Evaluations',
                              path: './evaluations',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.userManagementEdit.name,
                    Features.userManagementEdit.pages.evaluations.name
                )
                    ? [
                          {
                              displayName: 'Notes',
                              path: './notes',
                          },
                      ]
                    : []),
            ];
        })
    );

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.userEditState.init();
        this.activatedRoute.paramMap
            .pipe(takeUntil(this.destroyed$))
            .subscribe((param) => {
                const editUserId = param.get('id');
                if (editUserId) {
                    this.userEditState.setEditUserId(editUserId);
                } else {
                    this.userEditState.clearEditUserId();
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
