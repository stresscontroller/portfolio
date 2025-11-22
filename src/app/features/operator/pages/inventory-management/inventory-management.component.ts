import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InventoryManagementState } from './sub-pages/state';
import { Observable, combineLatest, map } from 'rxjs';
import { BadgeModule } from 'primeng/badge';
import { Features, UserState, checkPageAccess } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-inventory-management',
    templateUrl: './inventory-management.component.html',
    styleUrls: ['../../operator.scss', './inventory-management.component.scss'],
    imports: [CommonModule, RouterModule, BadgeModule, PermissionDirective],
    providers: [InventoryManagementState],
})
export class InventoryManagementComponent {
    userState = inject(UserState);
    inventoryManagementState = inject(InventoryManagementState);
    features = Features;
    recentlyReleasedInventoriesCount$ =
        this.inventoryManagementState.recentlyReleasedInventories$.pipe(
            map((inventories) => inventories?.length || 0)
        );

    inventoryNavOptions$: Observable<
        {
            displayName: string;
            path: string;
            badge?: number;
        }[]
    > = combineLatest([
        this.userState.controls$,
        this.recentlyReleasedInventoriesCount$,
    ]).pipe(
        map(([featureControls, recentlyReleasedInventoriesCount]) => {
            return [
                // hide dashboard for now until we have contents to show
                // {
                //     displayName: 'Dashboard',
                //     path: './dashboard',
                // },
                ...(checkPageAccess(
                    featureControls,
                    Features.inventoryManagement.name,
                    Features.inventoryManagement.pages.manageAllocation.name
                )
                    ? [
                          {
                              displayName: 'Allocation Architect',
                              path: './manage-allocation',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.inventoryManagement.name,
                    Features.inventoryManagement.pages.needingAllocation.name
                )
                    ? [
                          {
                              displayName: 'Capacity Alerts',
                              path: './needing-allocation',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.inventoryManagement.name,
                    Features.inventoryManagement.pages
                        .recentlyReleasedInventories.name
                )
                    ? [
                          {
                              displayName: 'Recently Released Inventories',
                              path: './recently-released-inventories',
                              badge: recentlyReleasedInventoriesCount,
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.inventoryManagement.name,
                    Features.inventoryManagement.pages.salesAndReports.name
                )
                    ? [
                          {
                              displayName: 'Sales Report Mapping Matrix',
                              path: './sales-and-report',
                          },
                      ]
                    : []),
            ];
        })
    );

    ngOnInit(): void {
        this.inventoryManagementState.init();
    }
}
