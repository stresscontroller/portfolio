import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { BadgeModule } from 'primeng/badge';
import { Features, UserState, checkPageAccess } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
    imports: [CommonModule, RouterModule, BadgeModule, PermissionDirective],
})
export class MainPageManagementComponent {
    userState = inject(UserState);
    features = Features;

    companySettingsNavOptions$: Observable<
        {
            displayName: string;
            path: string;
            badge?: number;
        }[]
    > = this.userState.controls$.pipe(
        map((featureControls) => {
            return [
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.dashboard.name
                )
                    ? [
                          {
                              displayName: 'Company Info',
                              path: './company-info',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.dashboard.name
                )
                    ? [
                          {
                              displayName: 'Departments',
                              path: './departments',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.dashboard.name
                )
                    ? [
                          {
                              displayName: 'Positions',
                              path: './positions',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.dashboard.name
                )
                    ? [
                          {
                              displayName: 'Organization Chart',
                              path: './organization-chart',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.dashboard.name
                )
                    ? [
                          {
                              displayName: 'Locations',
                              path: './locations',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.dashboard.name
                )
                    ? [
                          {
                              displayName: 'Qualifications',
                              path: './qualifications',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.dashboard.name
                )
                    ? [
                          {
                              displayName: 'Special Licenses',
                              path: './special-licenses',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.companySettings.name,
                    Features.companySettings.pages.jobs.name
                )
                    ? [
                          {
                              displayName: 'Jobs',
                              path: './jobs',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.dashboard.name
                )
                    ? [
                          {
                              displayName: 'Job Applicants',
                              path: './job-applicants',
                          },
                      ]
                    : []),
            ];
        })
    );
}
