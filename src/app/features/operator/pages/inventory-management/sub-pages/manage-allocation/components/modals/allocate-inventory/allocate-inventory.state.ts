import { Injectable, inject } from '@angular/core';
import {
    AllocatedItem,
    InventoryManagementApiService,
    TourInventoryItem,
    UnallocatedTourInventoryItemForm,
    UserState,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, tap } from 'rxjs';
import { AllocationAllocatedSearch } from '../../../../../models';

@Injectable()
export class AllocateInventoryState {
    inventoryManagementApiService = inject(InventoryManagementApiService);
    userState = inject(UserState);
    inventory$ = new BehaviorSubject<TourInventoryItem[]>([]);

    searchInventory(
        config: AllocationAllocatedSearch & {
            tourId: number;
            hideDuplicateInventories?: boolean;
        }
    ) {
        this.inventory$.next([]);
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return Promise.reject('missing companyUniqueId');
            }

            delete config.shipCompanyId;
            return lastValueFrom(
                this.inventoryManagementApiService
                    .getAllocatedDataByFilter({
                        ...config,
                        searchBy: 'UA',
                        companyId: user.companyUniqueID,
                    })
                    .pipe(
                        tap((res) => {
                            if (config.hideDuplicateInventories) {
                                const filteredResults = res.data.filter(
                                    (inventory, index) => {
                                        return (
                                            res.data.findIndex(
                                                (item) =>
                                                    item.tourID ===
                                                        inventory.tourID &&
                                                    item.unallocatedTourInventoryAllocatedSeats ===
                                                        inventory.unallocatedTourInventoryAllocatedSeats &&
                                                    item.tourInventoryDateString ===
                                                        inventory.tourInventoryDateString &&
                                                    item.unallocatedTourInventoryTime ===
                                                        inventory.unallocatedTourInventoryTime
                                            ) === index
                                        );
                                    }
                                );
                                this.inventory$.next(filteredResults);
                            } else {
                                this.inventory$.next(res.data);
                            }
                        })
                    )
            );
        });
    }

    saveUnallocatedTourInventory(config: UnallocatedTourInventoryItemForm) {
        return lastValueFrom(
            this.inventoryManagementApiService.saveUnallocatedTourInventory(
                config
            )
        );
    }

    allocateInventory(config: Omit<AllocatedItem, 'userId'>) {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }

            return lastValueFrom(
                this.inventoryManagementApiService.saveAllocated({
                    ...config,
                    userId: user.id,
                })
            );
        });
    }

    resetInventory(): void {
        this.inventory$.next([]);
    }
}
