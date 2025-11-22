import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const USER_MANAGEMENT_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./user-management.component').then(
                (c) => c.UserManagementComponent
            ),
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./pages/dashboard/dashboard.routes').then(
                        (r) => r.DASHBOARD_ROUTES
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.userManagement.name,
                    pages: Object.values(Features.userManagement.pages).map(
                        (page) => page.name
                    ),
                },
            },
            {
                path: 'users/:id',
                loadChildren: () =>
                    import('./pages/user-edit/user-edit.routes').then(
                        (r) => r.USER_EDIT_ROUTES
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.userManagementEdit.name,
                    pages: Object.values(Features.userManagementEdit.pages).map(
                        (page) => page.name
                    ),
                },
            },
            {
                path: '**',
                redirectTo: 'dashboard',
            },
        ],
    },
];
