import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Features, UserState, checkPageAccess } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [CommonModule, RouterModule, PermissionDirective],
})
export class DashboardComponent {
    userState = inject(UserState);

    displayNavPermission = Object.values(Features.toursAndServices.pages).map(
        (page) => ({
            feature: Features.toursAndServices.name,
            page: page.name,
        })
    );

    toursAndServicesNavOptions$: Observable<
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
                    Features.toursAndServices.name,
                    Features.toursAndServices.pages.tourList.name
                )
                    ? [
                          {
                              displayName: 'Tours List',
                              path: './tours-list',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServices.name,
                    Features.toursAndServices.pages.faq.name
                )
                    ? [
                          {
                              displayName: 'FAQ',
                              path: './faq',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServices.name,
                    Features.toursAndServices.pages.dock.name
                )
                    ? [
                          {
                              displayName: 'Docks',
                              path: './dock',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServices.name,
                    Features.toursAndServices.pages.pickupLocation.name
                )
                    ? [
                          {
                              displayName: 'Pick-up Locations',
                              path: './pickup-location',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServices.name,
                    Features.toursAndServices.pages.discountCode.name
                )
                    ? [
                          {
                              displayName: 'Discount Codes',
                              path: './discount-code',
                          },
                      ]
                    : []),
            ];
        })
    );
}
