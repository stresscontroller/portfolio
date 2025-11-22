import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const TOURS_AND_SERVIES_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./tours-and-services.component').then(
                (c) => c.ToursAndServicesComponent
            ),
        children: [
            {
                path: 'tour/:id',
                loadChildren: () =>
                    import('./pages/tour-edit/tour-edit.routes').then(
                        (r) => r.TOUR_EDIT_ROUTES
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServicesEdit.name,
                    pages: Object.values(
                        Features.toursAndServicesEdit.pages
                    ).map((page) => page.name),
                },
            },
            {
                path: '',
                loadChildren: () =>
                    import('./pages/dashboard/dashboard.routes').then(
                        (r) => r.DASHBOARD_ROUTES
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServices.name,
                    pages: Object.values(Features.toursAndServices.pages).map(
                        (page) => page.name
                    ),
                },
            },

            {
                path: '**',
                redirectTo: '/',
            },
        ],
    },
];
