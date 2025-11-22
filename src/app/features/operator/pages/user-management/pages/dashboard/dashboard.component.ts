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

    userManagementNavOptions$: Observable<
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
                    Features.userManagement.name,
                    Features.userManagement.pages.userList.name
                )
                    ? [
                          {
                              displayName: 'Users',
                              path: './users',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.userManagement.name,
                    Features.userManagement.pages.userRoles.name
                )
                    ? [
                          {
                              displayName: 'Roles',
                              path: './roles',
                          },
                      ]
                    : []),
            ];
        })
    );
}
