import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Features, UserState, checkPageAccess } from '@app/core';
import { RouterModule } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss', '../../operator.scss'],
    imports: [CommonModule, RouterModule, PermissionDirective],
})
export class ProfileComponent {
    userState = inject(UserState);
    features = Features;
    profileFeatures = Object.values(Features.profile.pages).map((page) => ({
        feature: Features.profile.name,
        page: page.name,
    }));
    navOptions$: Observable<
        {
            displayName: string;
            path: string;
        }[]
    > = combineLatest([
        this.userState.controls$,
        this.userState.aspNetUser$,
    ]).pipe(
        map(([featureControls, userDetails]) => {
            if (!userDetails?.isEmployee) {
                return [];
            }
            return [
                ...(checkPageAccess(
                    featureControls,
                    Features.profile.name,
                    Features.profile.pages.userInformation.name
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
                    Features.profile.name,
                    Features.profile.pages.payroll.name
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
                    Features.profile.name,
                    Features.profile.pages.certifications.name
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
                    Features.profile.name,
                    Features.profile.pages.specialLicenses.name
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
                    Features.profile.name,
                    Features.profile.pages.training.name
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
                    Features.profile.name,
                    Features.profile.pages.housing.name
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
                    Features.profile.name,
                    Features.profile.pages.evaluations.name
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
                    Features.profile.name,
                    Features.profile.pages.notes.name
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
}
