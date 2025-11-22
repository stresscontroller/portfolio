import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const INVENTORY_MANAGEMENT_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./inventory-management.component').then(
                (c) => c.InventoryManagementComponent
            ),
        children: [
            {
                path: '',
                redirectTo: 'manage-allocation',
                pathMatch: 'full',
            },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./sub-pages/dashboard/dashboard.component').then(
                        (c) => c.DashboardComponent
                    ),
            },
            {
                path: 'manage-allocation',
                loadComponent: () =>
                    import(
                        './sub-pages/manage-allocation/manage-allocation.component'
                    ).then((c) => c.ManageAllocationComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.inventoryManagement.name,
                    pages: [
                        Features.inventoryManagement.pages.manageAllocation
                            .name,
                    ],
                },
            },
            {
                path: 'needing-allocation/details',
                loadComponent: () =>
                    import(
                        './sub-pages/needing-allocation-details/needing-allocation-details.component'
                    ).then((c) => c.NeedingAllocationDetailsComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.inventoryManagement.name,
                    pages: [
                        Features.inventoryManagement.pages.needingAllocation
                            .name,
                    ],
                },
            },
            {
                path: 'needing-allocation',
                loadComponent: () =>
                    import(
                        './sub-pages/needing-allocation/needing-allocation.component'
                    ).then((c) => c.NeedingAllocationComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.inventoryManagement.name,
                    pages: [
                        Features.inventoryManagement.pages.needingAllocation
                            .name,
                    ],
                },
            },
            {
                path: 'recently-released-inventories',
                loadComponent: () =>
                    import(
                        './sub-pages/recently-released-inventories/recently-released-inventories.component'
                    ).then((c) => c.RecentlyReleasedInventoriesComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.inventoryManagement.name,
                    pages: [
                        Features.inventoryManagement.pages
                            .recentlyReleasedInventories.name,
                    ],
                },
            },
            {
                path: 'sales-and-report',
                loadComponent: () =>
                    import(
                        './sub-pages/sales-and-report/sales-and-report.component'
                    ).then((c) => c.SalesAndReportComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.inventoryManagement.name,
                    pages: [
                        Features.inventoryManagement.pages.salesAndReports.name,
                    ],
                },
            },
            {
                path: '**',
                redirectTo: 'manage-allocation',
            },
        ],
    },
];
