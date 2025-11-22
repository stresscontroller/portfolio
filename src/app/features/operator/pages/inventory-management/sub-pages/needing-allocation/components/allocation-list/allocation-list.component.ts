import { CommonModule, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { AllocationState, UIState } from '../../state';
import { ActivatedRoute, Router } from '@angular/router';
import {
    UIState as CommonState,
    Features,
    InventoryManagementItem,
    NeededAllocationTourInventoryReminderItem,
    UserState,
    adjustDate,
    checkPageFeatureAccess,
} from '@app/core';
import { ConfirmationDialogMessages } from '@app/core';
import { TooltipModule } from 'primeng/tooltip';
import { NeedingAllocationSelectedInventory } from '../../../../models';
import { DividerModule } from 'primeng/divider';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { Observable, map } from 'rxjs';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-allocation-list',
    templateUrl: './allocation-list.component.html',
    styleUrls: ['./allocation-list.component.scss'],
    imports: [
        CommonModule,
        DataViewModule,
        TableModule,
        ButtonModule,
        DividerModule,
        MenuModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class AllocationListComponent {
    router = inject(Router);
    route = inject(ActivatedRoute);

    uiState = inject(UIState);
    userState = inject(UserState);
    commonState = inject(CommonState);
    needingAllocationState = inject(AllocationState);
    features = Features;
    allocationData$ = this.needingAllocationState.needingAllocationData$;
    activeMenuInventory: InventoryManagementItem | undefined = undefined;
    dataOptions$: Observable<(MenuItem & { customIcon?: string })[]> =
        this.userState.controls$.pipe(
            map((featureControls) => {
                return [
                    ...(checkPageFeatureAccess(
                        featureControls,
                        Features.inventoryManagement.name,
                        Features.inventoryManagement.pages.needingAllocation
                            .name,
                        Features.inventoryManagement.pages.needingAllocation
                            .features.editInventory.name
                    )
                        ? [
                              {
                                  label: 'Edit',
                                  icon: 'pi pi-pencil',
                                  command: () => {
                                      if (this.activeMenuInventory) {
                                          this.openEditPage(
                                              this.activeMenuInventory
                                          );
                                      }
                                  },
                              },
                          ]
                        : []),
                    ...(checkPageFeatureAccess(
                        featureControls,
                        Features.inventoryManagement.name,
                        Features.inventoryManagement.pages.needingAllocation
                            .name,
                        Features.inventoryManagement.pages.needingAllocation
                            .features.setReminder.name
                    )
                        ? [
                              {
                                  label: 'Set Reminder',
                                  icon: 'pi pi-bell',
                                  command: () => {
                                      if (this.activeMenuInventory) {
                                          this.openSetReminderModal(
                                              this.activeMenuInventory
                                          );
                                      }
                                  },
                              },
                          ]
                        : []),
                    ...(checkPageFeatureAccess(
                        featureControls,
                        Features.inventoryManagement.name,
                        Features.inventoryManagement.pages.needingAllocation
                            .name,
                        Features.inventoryManagement.pages.needingAllocation
                            .features.ignoreReminder.name
                    )
                        ? [
                              {
                                  label: 'Ignore',
                                  customIcon: '/assets/icons/ic_bell_cross.svg',
                                  command: () => {
                                      if (this.activeMenuInventory) {
                                          this.openIgnoreModal(
                                              this.activeMenuInventory
                                          );
                                      }
                                  },
                              },
                          ]
                        : []),
                ];
            })
        );

    openSetReminderModal(item: InventoryManagementItem): void {
        this.uiState.openSetReminderModal(item);
    }

    openIgnoreModal(item: InventoryManagementItem): void {
        this.commonState.openConfirmationDialog({
            title: ConfirmationDialogMessages.inventoryManagement
                .removeConfirmation.title,
            description:
                ConfirmationDialogMessages.inventoryManagement
                    .removeConfirmation.description,
            buttons: [
                {
                    text: ConfirmationDialogMessages.inventoryManagement
                        .removeConfirmation.buttons.cancel,
                    onClick: () => {},
                    isPrimary: true,
                },
                {
                    text: ConfirmationDialogMessages.inventoryManagement
                        .removeConfirmation.buttons.remove,
                    onClick: () => {
                        const ignoreItem: NeededAllocationTourInventoryReminderItem =
                            {
                                companyId: '',
                                tourId: item.tourID,
                                shipId: item.shipId || -1,
                                tourDate: formatDate(
                                    new Date(item.tourInventoryDateString),
                                    'YYYY-MM-dd',
                                    'en-US'
                                ),
                                isIgnored: true,
                                isRemindLater: false,
                                reminderBeginDate: formatDate(
                                    adjustDate(new Date()),
                                    'YYYY-MM-dd',
                                    'en-US'
                                ),
                            };

                        this.needingAllocationState
                            .setReminder(ignoreItem)
                            .then(() => {
                                this.needingAllocationState.refresh();
                            });
                    },
                    isPrimary: false,
                },
            ],
        });
    }

    openEditPage(item: InventoryManagementItem): void {
        const filter =
            this.needingAllocationState.needingAllocationConfig$.getValue()
                .filter;
        if (!filter) {
            return;
        }

        this.needingAllocationState.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                // TODO: something
            } else {
                const extendedModel: {
                    selectedItem: NeedingAllocationSelectedInventory;
                } = {
                    selectedItem: {
                        companyId: user.companyUniqueID,
                        tourId: item.tourID,
                        tourName: item.tourName,
                        portId: item.portId,
                        portName: item.portName,
                        shipId: item.shipId,
                        shipName: item.shipName,
                        shipCompanyId: item.shipCompanyId,
                        threshold: item.threshold,
                        seatSold: item.seatSold,
                        seatAllocated: item.seatAllocated,
                        tourDate: formatDate(
                            new Date(item.tourInventoryDateString),
                            'YYYY-MM-dd',
                            'en-US'
                        ),
                        usePercentage: filter.usePercentage || 0,
                        isUseSeats: filter.isUseSeats || false,
                        isUsePercentage: filter.isUsePercentage || false,
                        useSeats: filter.useSeats || 0,
                    },
                };

                this.router.navigate(['./details'], {
                    relativeTo: this.route,
                    queryParams: {
                        selected: btoa(JSON.stringify(extendedModel)),
                        filters: btoa(JSON.stringify(filter)),
                    },
                });
            }
        });
    }
}
