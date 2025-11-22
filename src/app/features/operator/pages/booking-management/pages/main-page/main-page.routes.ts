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
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./sub-pages/dashboard/dashboard.component').then(
                        (c) => c.DashboardComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [Features.bookingManagement.pages.dashboard.name],
                },
            },
            {
                path: 'bookings',
                loadChildren: () =>
                    import('./sub-pages/bookings/bookings.routes').then(
                        (c) => c.BOOKINGS_ROUTES
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [Features.bookingManagement.pages.bookings.name],
                },
            },
            {
                path: 'tour-inventory',
                loadComponent: () =>
                    import(
                        './sub-pages/tour-inventory/tour-inventory.component'
                    ).then((c) => c.TourInventoryComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [
                        Features.bookingManagement.pages.tourInventory.name,
                    ],
                },
            },
            {
                path: 'cruise-lines',
                loadComponent: () =>
                    import(
                        './sub-pages/cruise-lines/cruise-lines.component'
                    ).then((c) => c.CruiseLinesComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [Features.bookingManagement.pages.cruiseLines.name],
                },
            },
            {
                path: 'cruise-ships',
                loadComponent: () =>
                    import(
                        './sub-pages/cruise-ships/cruise-ships.component'
                    ).then((c) => c.CruiseShipsComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [Features.bookingManagement.pages.cruiseLines.name],
                },
            },
            {
                path: 'agents',
                loadComponent: () =>
                    import('./sub-pages/agents/agents.component').then(
                        (c) => c.AgentsComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [Features.bookingManagement.pages.agents.name],
                },
            },
            {
                path: 'payments',
                loadComponent: () =>
                    import('./sub-pages/payments/payments.component').then(
                        (c) => c.PaymentsComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: [Features.bookingManagement.pages.payments.name],
                },
            },
            {
                path: '**',
                redirectTo: 'dashboard',
            },
        ],
    },
];
