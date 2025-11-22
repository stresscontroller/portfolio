import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { BadgeModule } from 'primeng/badge';
import { Features, UserState, checkPageAccess } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
    imports: [CommonModule, RouterModule, BadgeModule, PermissionDirective],
})
export class MainPageManagementComponent {
    userState = inject(UserState);
    features = Features;

    bookingManagementNavOptions$: Observable<
        {
            displayName: string;
            path: string;
            badge?: number;
        }[]
    > = this.userState.controls$.pipe(
        map((featureControls) => {
            return [
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.dashboard.name
                )
                    ? [
                          {
                              displayName: 'Dashboard',
                              path: './dashboard',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.bookings.name
                )
                    ? [
                          {
                              displayName: 'Bookings',
                              path: './bookings',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.tourInventory.name
                )
                    ? [
                          {
                              displayName: 'Tour Inventory',
                              path: './tour-inventory',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.cruiseLines.name
                )
                    ? [
                          {
                              displayName: 'Cruise Lines',
                              path: './cruise-lines',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.cruiseLines.name
                )
                    ? [
                          {
                              displayName: 'Cruise Ships',
                              path: './cruise-ships',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.agents.name
                )
                    ? [
                          {
                              displayName: 'Agents',
                              path: './agents',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagement.name,
                    Features.bookingManagement.pages.payments.name
                )
                    ? [
                          {
                              displayName: 'Payments',
                              path: './payments',
                          },
                      ]
                    : []),
            ];
        })
    );
}
