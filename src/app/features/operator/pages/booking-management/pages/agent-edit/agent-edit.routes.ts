import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const AGENT_EDIT_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./agent-edit.component').then((c) => c.AgentEditComponent),
        children: [
            {
                path: '',
                redirectTo: 'account',
                pathMatch: 'full',
            },
            {
                path: 'account',
                loadComponent: () =>
                    import('./sub-pages/account/account.component').then(
                        (c) => c.AccountComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagementAgentEdit.name,
                    pages: [
                        Features.bookingManagementAgentEdit.pages.account.name,
                    ],
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
                    feature: Features.bookingManagementAgentEdit.name,
                    pages: [
                        Features.bookingManagementAgentEdit.pages.bookings.name,
                    ],
                },
            },
            {
                path: 'statements/details',
                loadComponent: () =>
                    import(
                        './sub-pages/statement-details/statement-details.component'
                    ).then((c) => c.StatementDetailsComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagementAgentEdit.name,
                    pages: [
                        Features.bookingManagementAgentEdit.pages
                            .statementDetails.name,
                    ],
                },
            },
            {
                path: 'statements',
                loadComponent: () =>
                    import('./sub-pages/statements/statements.component').then(
                        (c) => c.StatementsComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagementAgentEdit.name,
                    pages: [
                        Features.bookingManagementAgentEdit.pages.statements
                            .name,
                    ],
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
                    feature: Features.bookingManagementAgentEdit.name,
                    pages: [
                        Features.bookingManagementAgentEdit.pages.payments.name,
                    ],
                },
            },
            {
                path: 'agreements',
                loadComponent: () =>
                    import('./sub-pages/agreements/agreements.component').then(
                        (c) => c.AgreementsComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.bookingManagementAgentEdit.name,
                    pages: [
                        Features.bookingManagementAgentEdit.pages.agreements
                            .name,
                    ],
                },
            },
            {
                path: '**',
                redirectTo: 'account',
            },
        ],
    },
];
