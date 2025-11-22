import { Route } from '@angular/router';

export const ADMIN_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./admin.component').then((c) => c.AdminComponent),
        children: [
            {
                path: '',
                redirectTo: 'api',
                pathMatch: 'full',
            },
            {
                path: 'api',
                loadComponent: () =>
                    import('./api/api.component').then((c) => c.ApiComponent),
            },
        ],
    },
];
