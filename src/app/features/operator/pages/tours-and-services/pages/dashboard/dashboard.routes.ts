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
                redirectTo: 'tours-list',
                pathMatch: 'full',
            },
            {
                path: 'tours-list',
                loadComponent: () =>
                    import('./sub-pages/tours-list/tours-list.component').then(
                        (c) => c.ToursListComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServices.name,
                    pages: [Features.toursAndServices.pages.tourList.name],
                },
            },
            {
                path: 'faq',
                loadComponent: () =>
                    import('./sub-pages/faq/faq.component').then(
                        (c) => c.FaqComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServices.name,
                    pages: [Features.toursAndServices.pages.faq.name],
                },
            },
            {
                path: 'dock',
                loadComponent: () =>
                    import('./sub-pages/dock/dock.component').then(
                        (c) => c.DockComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServices.name,
                    pages: [Features.toursAndServices.pages.dock.name],
                },
            },
            {
                path: 'pickup-location',
                loadComponent: () =>
                    import(
                        './sub-pages/pickup-location/pickup-location.component'
                    ).then((c) => c.PickupLocationComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServices.name,
                    pages: [
                        Features.toursAndServices.pages.pickupLocation.name,
                    ],
                },
            },
            {
                path: 'discount-code',
                loadComponent: () =>
                    import(
                        './sub-pages/discount-code/discount-code.component'
                    ).then((c) => c.DiscountCodeComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServices.name,
                    pages: [Features.toursAndServices.pages.discountCode.name],
                },
            },
            {
                path: '**',
                redirectTo: 'tours-list',
            },
        ],
    },
];
