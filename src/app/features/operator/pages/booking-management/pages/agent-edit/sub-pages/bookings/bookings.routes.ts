import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const BOOKINGS_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./overview/overview.component').then(
                (c) => c.OverviewComponent
            ),
        canActivate: [featureGuardCanActivate],
        data: {
            feature: Features.bookingManagementAgentEdit.name,
            pages: [Features.bookingManagementAgentEdit.pages.bookings.name],
        },
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./manage/manage.component').then((c) => c.ManageComponent),
        canActivate: [featureGuardCanActivate],
        data: {
            feature: Features.bookingManagementAgentEdit.name,
            pages: [Features.bookingManagementAgentEdit.pages.bookings.name],
        },
    },
];
