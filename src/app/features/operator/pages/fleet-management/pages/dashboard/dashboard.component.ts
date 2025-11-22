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
    features = Features;
    userState = inject(UserState);

    fleetManagementNavOptions$: Observable<
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
                    Features.fleetManagement.name,
                    Features.fleetManagement.pages.stats.name
                )
                    ? [
                          {
                              displayName: 'Dashboard',
                              path: './stats',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.fleetManagement.name,
                    Features.fleetManagement.pages.equipments.name
                )
                    ? [
                          {
                              displayName: 'Equipment',
                              path: './equipment',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.fleetManagement.name,
                    Features.fleetManagement.pages.equipmentTypes.name
                )
                    ? [
                          {
                              displayName: 'Equipment Type',
                              path: './equipment-type',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.fleetManagement.name,
                    Features.fleetManagement.pages.forms.name
                )
                    ? [
                          {
                              displayName: 'Forms',
                              path: './forms',
                          },
                      ]
                    : []),
            ];
        })
    );
}
