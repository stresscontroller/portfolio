import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const BOOKING_MANAGEMENT_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./company-settings.component').then(
                (c) => c.CompanySettingsComponent
            ),
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./pages/main-page/main-page.routes').then(
                        (r) => r.MAIN_PAGE_ROUTES
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.companySettings.name,
                    pages: Object.values(Features.companySettings.pages).map(
                        (page) => page.name
                    ),
                },
            },

            {
                path: '**',
                redirectTo: 'main-page',
            },
        ],
    },
];
