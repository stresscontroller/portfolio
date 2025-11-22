import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const DASHBOARD_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./dashboard.component').then((c) => c.DashboardComponent),
        children: [
            {
                path: '',
                redirectTo: 'users',
                pathMatch: 'full',
            },
            {
                path: 'users',
                loadComponent: () =>
                    import('./sub-pages/user-list/user-list.component').then(
                        (c) => c.UserListComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.userManagement.name,
                    pages: [Features.userManagement.pages.userList.name],
                },
            },
            {
                path: 'roles',
                loadComponent: () =>
                    import('./sub-pages/role-list/role-list.component').then(
                        (c) => c.RoleListComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.userManagement.name,
                    pages: [Features.userManagement.pages.userRoles.name],
                },
            },
            {
                path: 'communications',
                loadComponent: () =>
                    import(
                        './sub-pages/communications/communications.component'
                    ).then((c) => c.CommunicationsComponent),
                // canActivate: [featureGuardCanActivate],
                // data: {
                //     feature: Features.userManagement.name,
                //     pages: [Features.userManagement.pages.communications.name],
                // },
            },
            {
                path: '**',
                redirectTo: 'users',
            },
        ],
    },
];
