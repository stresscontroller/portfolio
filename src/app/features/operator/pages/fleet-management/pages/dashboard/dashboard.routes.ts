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
                redirectTo: 'stats',
                pathMatch: 'full',
            },
            {
                path: 'stats',
                loadComponent: () =>
                    import('./sub-pages/stats/stats.component').then(
                        (c) => c.StatsComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.fleetManagement.name,
                    pages: [Features.fleetManagement.pages.stats.name],
                },
            },
            {
                path: 'equipment',
                loadComponent: () =>
                    import('./sub-pages/equipment/equipment.component').then(
                        (c) => c.EquipmentComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.fleetManagement.name,
                    pages: [Features.fleetManagement.pages.equipments.name],
                },
            },
            {
                path: 'equipment-type',
                loadComponent: () =>
                    import(
                        './sub-pages/equipment-type/equipment-type.component'
                    ).then((c) => c.EquipmentTypeComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.fleetManagement.name,
                    pages: [Features.fleetManagement.pages.equipmentTypes.name],
                },
            },
            {
                path: 'forms',
                loadComponent: () =>
                    import('./sub-pages/forms/forms.component').then(
                        (c) => c.FormsComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.fleetManagement.name,
                    pages: [Features.fleetManagement.pages.forms.name],
                },
            },
            {
                path: '**',
                redirectTo: 'stats',
            },
        ],
    },
];
