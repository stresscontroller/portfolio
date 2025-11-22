import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const BOOKING_MANAGEMENT_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./booking-management.component').then(
                (c) => c.BookingManagementComponent
            ),
        children: [
            {
                path: 'agent/:id',
                loadChildren: () =>
                    import('./pages/agent-edit/agent-edit.routes').then(
                        (r) => r.AGENT_EDIT_ROUTES
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagementAgentEdit.name,
                    pages: Object.values(
                        Features.bookingManagementAgentEdit.pages
                    ).map((page) => page.name),
                },
            },
            {
                path: '',
                loadChildren: () =>
                    import('./pages/main-page/main-page.routes').then(
                        (r) => r.MAIN_PAGE_ROUTES
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagement.name,
                    pages: Object.values(Features.bookingManagement.pages).map(
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
