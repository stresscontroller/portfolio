import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const FLEET_MANAGEMENT_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./fleet-management.component').then(
                (c) => c.FleetManagementComponent
            ),
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./pages/dashboard/dashboard.routes').then(
                        (r) => r.DASHBOARD_ROUTES
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.fleetManagement.name,
                    pages: Object.values(Features.fleetManagement.pages).map(
                        (page) => page.name
                    ),
                },
            },
            {
                path: 'equipment/:id',
                loadChildren: () =>
                    import('./pages/equipment/equipment.routes').then(
                        (r) => r.EQUIPMENT_ROUTES
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.fleetManagementEquipment.name,
                    pages: Object.values(
                        Features.fleetManagementEquipment.pages
                    ).map((page) => page.name),
                },
            },
            {
                path: '**',
                redirectTo: 'dashboard',
            },
        ],
    },
];
