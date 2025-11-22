import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const EQUIPMENT_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./equipment.component').then((c) => c.EquipmentComponent),
        children: [
            {
                path: '',
                redirectTo: 'info',
                pathMatch: 'full',
            },
            {
                path: 'info',
                loadComponent: () =>
                    import(
                        './sub-pages/equipment-info/equipment-info.component'
                    ).then((c) => c.EquipmentInfoComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.fleetManagementEquipment.name,
                    pages: [
                        Features.fleetManagementEquipment.pages.equipmentInfo
                            .name,
                    ],
                },
            },
            {
                path: 'usage',
                loadComponent: () =>
                    import('./sub-pages/usage/usage.component').then(
                        (c) => c.UsageComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.fleetManagementEquipment.name,
                    pages: [Features.fleetManagementEquipment.pages.usage.name],
                },
            },
            {
                path: 'maintenance',
                loadComponent: () =>
                    import(
                        './sub-pages/maintenance/maintenance.component'
                    ).then((c) => c.MaintenanceComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.fleetManagementEquipment.name,
                    pages: [
                        Features.fleetManagementEquipment.pages.maintenance
                            .name,
                    ],
                },
            },
            {
                path: '**',
                redirectTo: 'info',
            },
        ],
    },
];
