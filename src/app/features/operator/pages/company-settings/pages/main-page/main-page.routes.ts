import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const MAIN_PAGE_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./main-page.component').then(
                (c) => c.MainPageManagementComponent
            ),
        children: [
            {
                path: '',
                redirectTo: 'company-info',
                pathMatch: 'full',
            },
            {
                path: 'company-info',
                loadComponent: () =>
                    import(
                        './sub-pages/company-info/company-info.component'
                    ).then((c) => c.CompanyInfoComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [
                        Features.bookingManagement.pages.tourInventory.name,
                    ],
                },
            },
            {
                path: 'departments',
                loadComponent: () =>
                    import(
                        './sub-pages/departments/departments.component'
                    ).then((c) => c.DepartmentsComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [
                        Features.bookingManagement.pages.tourInventory.name,
                    ],
                },
            },
            {
                path: 'positions',
                loadComponent: () =>
                    import('./sub-pages/positions/positions.component').then(
                        (c) => c.PositionsComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [
                        Features.bookingManagement.pages.tourInventory.name,
                    ],
                },
            },
            {
                path: 'organization-chart',
                loadComponent: () =>
                    import(
                        './sub-pages/organization-chart/organization-chart.component'
                    ).then((c) => c.OrganizationChartComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [
                        Features.bookingManagement.pages.tourInventory.name,
                    ],
                },
            },
            {
                path: 'locations',
                loadComponent: () =>
                    import('./sub-pages/locations/locations.component').then(
                        (c) => c.LocationssComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [
                        Features.bookingManagement.pages.tourInventory.name,
                    ],
                },
            },
            {
                path: 'qualifications',
                loadComponent: () =>
                    import(
                        './sub-pages/qualifications/qualifications.component'
                    ).then((c) => c.QualificationsComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [
                        Features.bookingManagement.pages.tourInventory.name,
                    ],
                },
            },
            {
                path: 'special-licenses',
                loadComponent: () =>
                    import(
                        './sub-pages/special-licenses/special-licenses.component'
                    ).then((c) => c.SpecialLicensesComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [
                        Features.bookingManagement.pages.tourInventory.name,
                    ],
                },
            },
            {
                path: 'jobs',
                loadComponent: () =>
                    import('./sub-pages/jobs/jobs.component').then(
                        (c) => c.JobsComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.companySettings.name,
                    pages: [Features.companySettings.pages.jobs.name],
                },
            },
            {
                path: 'job-applicants',
                loadComponent: () =>
                    import(
                        './sub-pages/job-applicants/job-applicants.component'
                    ).then((c) => c.JobApplicantsComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [
                        Features.bookingManagement.pages.tourInventory.name,
                    ],
                },
            },
            {
                path: '**',
                redirectTo: 'company-info',
            },
        ],
    },
];
