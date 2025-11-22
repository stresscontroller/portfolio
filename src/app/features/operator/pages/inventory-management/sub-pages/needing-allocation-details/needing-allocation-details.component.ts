import { CommonModule, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, lastValueFrom, map, shareReplay, takeUntil } from 'rxjs';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import {
    ErrorDialogMessages,
    InventoryManagementApiService,
    NeededAllocationTourInventoryDetailFilters,
    SuccessDialogMessages,
    UIState,
    adjustDate,
} from '@app/core';
import { LoaderEmbedComponent, InventoryCalendarComponent } from '@app/shared';
import {
    AllocationInfoComponent,
    AllocationTableComponent,
} from './components';
import { NeedingAllocationDetailsState } from './state';
import { NeedingAllocationSelectedInventory } from '../../models';
import { InventoryManagementState } from '../state';

@Component({
    standalone: true,
    selector: 'app-needing-allocation-details',
    templateUrl: './needing-allocation-details.component.html',
    styleUrls: ['./needing-allocation-details.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        DividerModule,
        AllocationInfoComponent,
        AllocationTableComponent,
        InventoryCalendarComponent,
        LoaderEmbedComponent,
    ],
    providers: [NeedingAllocationDetailsState],
})
export class NeedingAllocationDetailsComponent {
    activatedRoute = inject(ActivatedRoute);
    uiState = inject(UIState);
    router = inject(Router);
    needingAllocationDetailsState = inject(NeedingAllocationDetailsState);
    inventoryManagementState = inject(InventoryManagementState);
    inventoryManagementApiService = inject(InventoryManagementApiService);
    tourImage = '';
    needingAllocationData$ =
        this.needingAllocationDetailsState.needingAllocationDetailsInventories$;

    inventorySelected: string[] = [];
    dataIsLoading$ = this.needingAllocationDetailsState.status$.pipe(
        map((status) => {
            return (
                status.loadCalendar === 'loading' ||
                status.loadNeedingAllocationDetails === 'loading'
            );
        })
    );

    submitIsLoading$ = this.needingAllocationDetailsState.status$.pipe(
        map((status) => {
            return status.submitAllocateAndRelease === 'loading';
        })
    );

    calendar$ = this.needingAllocationDetailsState.calendar$;
    allocationConfig$ = this.activatedRoute.queryParams.pipe(
        map((queryParams) => {
            const selected = queryParams['selected'];
            try {
                if (selected) {
                    return JSON.parse(atob(selected)) as {
                        selectedItem: NeedingAllocationSelectedInventory;
                    };
                } else {
                    return undefined;
                }
            } catch (err) {
                return undefined;
            }
        }),
        shareReplay()
    );

    private destroyed$ = new Subject<void>();
    private needingAllocationFilters: string | undefined = undefined;
    ngOnInit() {
        this.needingAllocationDetailsState.init();
        this.activatedRoute.queryParams
            .pipe(takeUntil(this.destroyed$))
            .subscribe((queryParams) => {
                this.needingAllocationFilters = queryParams['filters'];
            });

        this.allocationConfig$
            .pipe(takeUntil(this.destroyed$))
            .subscribe(async (config) => {
                if (config && config.selectedItem.tourId) {
                    // load image using a separate API call
                    try {
                        this.tourImage = await lastValueFrom(
                            this.inventoryManagementApiService.getTourImage(
                                config.selectedItem.tourId
                            )
                        );
                    } catch (err) {
                        this.tourImage = '';
                    }
                    // Get data here from passed in params
                    const searchParams: NeededAllocationTourInventoryDetailFilters =
                        {
                            companyId: config.selectedItem.companyId || '',
                            tourId:
                                config.selectedItem.tourId.toString() || null,
                            shipId:
                                config.selectedItem.shipId?.toString() || null,
                            startDate:
                                config.selectedItem.tourDate ||
                                formatDate(new Date(), 'YYYY-MM-dd', 'en-US'),
                            portId: config.selectedItem.portId || 0,
                            isUsePercentage:
                                config.selectedItem.isUsePercentage || true,
                            isUseSeats: config.selectedItem.isUseSeats || false,
                            usePercentage:
                                config.selectedItem.usePercentage !== null
                                    ? config.selectedItem.usePercentage
                                    : 80,
                            useSeats: config.selectedItem.useSeats || 0,
                        };
                    this.needingAllocationDetailsState.updateNeedingDetailsAllocationConfig(
                        searchParams
                    );
                    this.needingAllocationDetailsState.setCalendarConfig({
                        date: adjustDate(
                            new Date(config.selectedItem.tourDate)
                        ),
                        tourId: config.selectedItem.tourId.toString(),
                        portId: config.selectedItem.portId || 0,
                    });
                } else {
                    this.uiState.openErrorDialog({
                        title: ErrorDialogMessages.inventoryManagement
                            .allocationNotFound.title,
                        description:
                            ErrorDialogMessages.inventoryManagement
                                .allocationNotFound.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.inventoryManagement
                                    .allocationNotFound.buttons.close,
                                isPrimary: true,
                                onClick: () => {
                                    this.back();
                                },
                            },
                        ],
                    });
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    selectedInventory(event: string[]) {
        this.inventorySelected = event;
    }

    back(): void {
        if (this.needingAllocationFilters) {
            // navigate with the config
            this.router.navigate(
                ['operator/inventory-management/needing-allocation'],
                {
                    replaceUrl: true,
                    queryParams: { filters: this.needingAllocationFilters },
                }
            );
        } else {
            this.router.navigate(
                ['operator/inventory-management/needing-allocation'],
                {
                    replaceUrl: true,
                }
            );
        }
    }

    saveReleaseInventory(shipId: string, shipCompanyId: number): void {
        if (this.inventorySelected.length === 0) {
            return;
        }
        this.needingAllocationDetailsState
            .saveReleaseInventory(this.inventorySelected, shipId, shipCompanyId)
            .then(() => {
                this.inventoryManagementState.refresh();
                this.uiState.openSuccessDialog({
                    title: SuccessDialogMessages.inventoryManagement
                        .allocateAndReleaseSuccess.title,
                    description:
                        SuccessDialogMessages.inventoryManagement
                            .allocateAndReleaseSuccess.description,
                    buttons: [
                        {
                            text: SuccessDialogMessages.inventoryManagement
                                .allocateAndReleaseSuccess.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                // go to the main allocation list
                                this.back();
                            },
                        },
                    ],
                });
                // clear out the selected inventory
                this.inventorySelected = [];
            })
            .catch(() => {
                this.uiState.openErrorDialog({
                    title: ErrorDialogMessages.inventoryManagement
                        .allocationNotFound.title,
                    description:
                        ErrorDialogMessages.inventoryManagement
                            .allocationNotFound.description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.inventoryManagement
                                .allocationNotFound.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
            });
    }
}
