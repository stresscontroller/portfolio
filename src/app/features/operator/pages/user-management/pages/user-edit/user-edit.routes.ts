import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const USER_EDIT_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./user-edit.component').then((c) => c.UserEditComponent),
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
                    feature: Features.userManagementEdit.name,
                    pages: [
                        Features.userManagementEdit.pages.userInformation.name,
                    ],
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
                    feature: Features.userManagementEdit.name,
                    pages: [Features.userManagementEdit.pages.notes.name],
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
                    feature: Features.userManagementEdit.name,
                    pages: [Features.userManagementEdit.pages.payroll.name],
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
                    feature: Features.userManagementEdit.name,
                    pages: [
                        Features.userManagementEdit.pages.certifications.name,
                    ],
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
                    feature: Features.userManagementEdit.name,
                    pages: [
                        Features.userManagementEdit.pages.specialLicenses.name,
                    ],
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
                    feature: Features.userManagementEdit.name,
                    pages: [Features.userManagementEdit.pages.training.name],
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
                    feature: Features.userManagementEdit.name,
                    pages: [Features.userManagementEdit.pages.housing.name],
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
                    feature: Features.userManagementEdit.name,
                    pages: [Features.userManagementEdit.pages.evaluations.name],
                },
            },
            {
                path: '**',
                redirectTo: 'user-information',
            },
        ],
    },
];
