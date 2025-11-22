import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { NavbarComponent } from '@app/shared';
import { Features, UserState, checkPageAccess, isWeb } from '@app/core';
import { Observable, map } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    standalone: true,
    selector: 'app-operator',
    templateUrl: './operator.component.html',
    styleUrls: ['./operator.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ButtonModule,
        TooltipModule,
        SidebarModule,
        NavbarComponent,
    ],
})
export class OperatorComponent {
    userState = inject(UserState);

    navOptions$: Observable<
        {
            displayName: string;
            path: string;
            icon: string;
        }[]
    > = this.userState.controls$.pipe(
        map((featureControls) => {
            return [
                ...(checkPageAccess(
                    featureControls,
                    Features.dailyTourDispatch.name
                )
                    ? [
                          {
                              displayName: 'Daily Tour Dispatch',
                              path: './tour-dispatch',
                              icon: 'pi-car',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.inventoryManagement.name,
                    [
                        Features.inventoryManagement.pages.manageAllocation
                            .name,
                        Features.inventoryManagement.pages.needingAllocation
                            .name,
                        Features.inventoryManagement.pages
                            .recentlyReleasedInventories.name,
                        Features.inventoryManagement.pages.salesAndReports.name,
                    ]
                )
                    ? [
                          {
                              displayName: 'Inventory Management',
                              path: './inventory-management',
                              icon: 'pi-book',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.cruiseCalendar.name,
                    Features.cruiseCalendar.pages.cruiseCalendar.name
                )
                    ? [
                          {
                              displayName: 'Cruise Calendar',
                              path: './cruise-calendar',
                              icon: 'pi-calendar',
                          },
                      ]
                    : []),

                ...(checkPageAccess(
                    featureControls,
                    Features.userManagement.name,
                    [
                        Features.userManagement.pages.userList.name,
                        Features.userManagement.pages.userRoles.name,
                    ]
                )
                    ? [
                          {
                              displayName: 'User Management',
                              path: './user-management',
                              icon: 'pi-users',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServices.name,
                    Object.values(Features.toursAndServices.pages).map(
                        (page) => page.name
                    )
                )
                    ? [
                          {
                              displayName: 'Tours And Services',
                              path: './tours-and-services',
                              icon: 'pi-map', // TODO: placeholder icon, we'll replace this later
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name
                )
                    ? [
                          {
                              displayName: 'Booking Management',
                              path: './booking-management',
                              icon: 'pi-book',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.fleetManagement.name
                )
                    ? [
                          {
                              displayName: 'Fleet Management',
                              path: './fleet-management',
                              icon: 'pi-warehouse',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.companySettings.name
                )
                    ? [
                          {
                              displayName: 'Company Settings',
                              path: './company-settings',
                              icon: 'pi-building-columns',
                          },
                      ]
                    : []),
                // only display download app option if you're on the web
                ...(isWeb() &&
                checkPageAccess(
                    featureControls,
                    Features.download.name,
                    Features.download.pages.install.name
                )
                    ? [
                          {
                              displayName: 'Download the App',
                              path: './mobile-app',
                              icon: 'pi-tablet',
                          },
                      ]
                    : []),
            ];
        })
    );

    drawerExpanded = true;
    mobileDrawerIsOpen = false;

    toggleDrawerExpanded(): void {
        this.drawerExpanded = !this.drawerExpanded;
    }

    openMobileDrawer(): void {
        this.mobileDrawerIsOpen = true;
    }
}
