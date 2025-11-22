import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EquipmentState } from './state';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { Features, UserState, checkPageAccess } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-equipment',
    templateUrl: './equipment.component.html',
    styleUrls: ['./equipment.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
    providers: [EquipmentState],
})
export class EquipmentComponent {
    activatedRoute = inject(ActivatedRoute);
    userState = inject(UserState);
    equipmentState = inject(EquipmentState);
    features = Features;
    editUserFeatures = Object.values(Features.userManagementEdit.pages).map(
        (page) => ({
            feature: Features.userManagementEdit.name,
            page: page.name,
        })
    );
    equipmentEditNavOptions$: Observable<
        {
            displayName: string;
            path: string;
        }[]
    > = this.userState.controls$.pipe(
        map((featureControls) => {
            return [
                ...(checkPageAccess(
                    featureControls,
                    Features.fleetManagementEquipment.name,
                    Features.fleetManagementEquipment.pages.equipmentInfo.name
                )
                    ? [
                          {
                              displayName: 'Equipment Info',
                              path: './info',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.fleetManagementEquipment.name,
                    Features.fleetManagementEquipment.pages.usage.name
                )
                    ? [
                          {
                              displayName: 'Usage',
                              path: './usage',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.fleetManagementEquipment.name,
                    Features.fleetManagementEquipment.pages.maintenance.name
                )
                    ? [
                          {
                              displayName: 'Maintenance',
                              path: './maintenance',
                          },
                      ]
                    : []),
            ];
        })
    );

    equipmentDetail$ = this.equipmentState.equipmentDetail$;
    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.equipmentState.init();
        this.activatedRoute.paramMap
            .pipe(takeUntil(this.destroyed$))
            .subscribe((param) => {
                const equipmentId = param.get('id');
                if (equipmentId) {
                    this.equipmentState.setEditEquipmentId(equipmentId);
                } else {
                    this.equipmentState.clearEditEquipmentId();
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
