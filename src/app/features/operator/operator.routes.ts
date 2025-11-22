import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const OPERATOR_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./operator.component').then((c) => c.OperatorComponent),
        children: [
            {
                path: '',
                redirectTo: 'tour-dispatch',
                pathMatch: 'full',
            },
            {
                path: 'tour-dispatch/:date',
                loadComponent: () =>
                    import(
                        './pages/tour-dispatch/tour-dispatch.component'
                    ).then((c) => c.TourDispatchComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.dailyTourDispatch.name,
                    pages: [
                        Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                    ],
                },
            },
            {
                path: 'tour-dispatch',
                loadComponent: () =>
                    import(
                        './pages/tour-dispatch/tour-dispatch.component'
                    ).then((c) => c.TourDispatchComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.dailyTourDispatch.name,
                    pages: [
                        Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                    ],
                },
            },
            {
                path: 'cruise-calendar',
                loadComponent: () =>
                    import(
                        './pages/cruise-calendar/cruise-calendar.component'
                    ).then((c) => c.CruiseCalendarComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.cruiseCalendar.name,
                    pages: Object.values(Features.cruiseCalendar.pages).map(
                        (page) => page.name
                    ),
                },
            },
            {
                path: 'inventory-management',
                loadChildren: () =>
                    import(
                        './pages/inventory-management/inventory-management.routes'
                    ).then((r) => r.INVENTORY_MANAGEMENT_ROUTES),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.inventoryManagement.name,
                    pages: Object.values(
                        Features.inventoryManagement.pages
                    ).map((page) => page.name),
                },
            },
            {
                path: 'user-management',
                loadChildren: () =>
                    import(
                        './pages/user-management/user-management.routes'
                    ).then((r) => r.USER_MANAGEMENT_ROUTES),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.userManagement.name,
                    pages: Object.values(Features.userManagement.pages).map(
                        (page) => page.name
                    ),
                },
            },
            {
                path: 'tours-and-services',
                loadChildren: () =>
                    import(
                        './pages/tours-and-services/tours-and-services.routes'
                    ).then((r) => r.TOURS_AND_SERVIES_ROUTES),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServices.name,
                    pages: Object.values(Features.toursAndServices.pages).map(
                        (page) => page.name
                    ),
                },
            },
            {
                path: 'profile',
                loadChildren: () =>
                    import('./pages/profile/profile.routes').then(
                        (c) => c.PROFILE_ROUTES
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.profile.name,
                    pages: Object.values(Features.profile.pages).map(
                        (page) => page.name
                    ),
                },
            },
            {
                path: 'mobile-app',
                loadComponent: () =>
                    import('./pages/mobile-app/mobile-app.component').then(
                        (c) => c.MobileAppComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.download.name,
                    pages: Object.values(Features.download.pages).map(
                        (page) => page.name
                    ),
                },
            },
            {
                path: 'booking-management',
                loadChildren: () =>
                    import(
                        './pages/booking-management/booking-management.routes'
                    ).then((r) => r.BOOKING_MANAGEMENT_ROUTES),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: Object.values(Features.bookingManagement.pages).map(
                        (page) => page.name
                    ),
                },
            },
            {
                path: 'fleet-management',
                loadChildren: () =>
                    import(
                        './pages/fleet-management/fleet-management.routes'
                    ).then((r) => r.FLEET_MANAGEMENT_ROUTES),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.fleetManagement.name,
                    pages: Object.values(Features.fleetManagement.pages).map(
                        (page) => page.name
                    ),
                },
            },
            {
                path: 'company-settings',
                loadChildren: () =>
                    import(
                        './pages/company-settings/company-settings.routes'
                    ).then((r) => r.BOOKING_MANAGEMENT_ROUTES),
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
                redirectTo: 'tour-dispatch',
            },
        ],
    },
];
