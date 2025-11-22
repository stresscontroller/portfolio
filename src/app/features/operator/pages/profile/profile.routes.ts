import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const PROFILE_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./profile.component').then((c) => c.ProfileComponent),
        children: [
            {
                path: '',
                redirectTo: 'user-information',
                pathMatch: 'full',
            },
            {
                path: 'user-information',
                loadComponent: () =>
                    import(
                        './sub-pages/user-information/user-information.component'
                    ).then((c) => c.UserInformationComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.profile.name,
                    pages: [Features.profile.pages.userInformation.name],
                },
            },
            {
                path: 'notes',
                loadComponent: () =>
                    import('./sub-pages/notes/notes.component').then(
                        (c) => c.NotesComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.profile.name,
                    pages: [Features.profile.pages.notes.name],
                },
            },
            {
                path: 'housing',
                loadComponent: () =>
                    import('./sub-pages/housing/housing.component').then(
                        (c) => c.HousingComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.profile.name,
                    pages: [Features.profile.pages.housing.name],
                },
            },
            {
                path: 'payroll',
                loadComponent: () =>
                    import('./sub-pages/payroll/payroll.component').then(
                        (c) => c.PayrollComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.profile.name,
                    pages: [Features.profile.pages.payroll.name],
                },
            },
            {
                path: 'certifications',
                loadComponent: () =>
                    import(
                        './sub-pages/certifications/certifications.component'
                    ).then((c) => c.CertificationsComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.profile.name,
                    pages: [Features.profile.pages.certifications.name],
                },
            },
            {
                path: 'licenses',
                loadComponent: () =>
                    import('./sub-pages/licenses/licenses.component').then(
                        (c) => c.LicensesComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.profile.name,
                    pages: [Features.profile.pages.specialLicenses.name],
                },
            },
            {
                path: 'training',
                loadComponent: () =>
                    import('./sub-pages/training/training.component').then(
                        (c) => c.TrainingComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.profile.name,
                    pages: [Features.profile.pages.training.name],
                },
            },
            {
                path: 'evaluations',
                loadComponent: () =>
                    import(
                        './sub-pages/evaluations/evaluations.component'
                    ).then((c) => c.EvaluationsComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.profile.name,
                    pages: [Features.profile.pages.evaluations.name],
                },
            },
            {
                path: '**',
                redirectTo: 'user-information',
            },
        ],
    },
];
