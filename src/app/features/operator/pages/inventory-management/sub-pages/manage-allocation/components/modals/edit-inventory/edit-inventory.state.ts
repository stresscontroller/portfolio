import { Injectable, inject } from '@angular/core';
import {
    InventoryManagementApiService,
    TourInventoryItem,
    UpdateBulkAllocatedUnallocatedInventories,
    UserState,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, tap } from 'rxjs';
import { AllocationDeleteSearch } from '../../../../../models';

@Injectable()
export class EditInventoryState {
    inventoryManagementApiService = inject(InventoryManagementApiService);
    userState = inject(UserState);
    inventories$ = new BehaviorSubject<TourInventoryItem[]>([]);
    selectedInventories$ = new BehaviorSubject<number[]>([]);
    searchParams$ = new BehaviorSubject<
        (AllocationDeleteSearch & { tourId: number }) | null
    >(null);
    searchInventory(config: AllocationDeleteSearch & { tourId: number }) {
        this.searchParams$.next(config);
        this.inventories$.next([]);
        this.clearSelectedInventories();
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return Promise.reject('missing companyUniqueId');
            }
            delete config.shipCompanyId;
            return lastValueFrom(
                this.inventoryManagementApiService
                    .getAllocatedDataByFilterToDelete({
                        ...config,
                        companyId: user.companyUniqueID,
                    })
                    .pipe(
                        tap((res) => {
                            this.inventories$.next(res.data);
                        })
                    )
            );
        });
    }

    updateInventories(
        inventory: Omit<UpdateBulkAllocatedUnallocatedInventories, 'userId'>
    ): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }
            return lastValueFrom(
                this.inventoryManagementApiService.saveBulkUnallocatedAllocatedTourInventory(
                    {
                        ...inventory,
                        userId: user.id,
                    }
                )
            ).then((res) => {
                if (!res.success) {
                    return Promise.reject(res.error);
                }
                return Promise.resolve();
            });
        });
    }

    deleteMulitpleInventory(config: { searchBy: string; ids: string }) {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }

            return lastValueFrom(
                this.inventoryManagementApiService.deleteMultipleInventory({
                    ...config,
                    userId: user.id,
                })
            );
        });
    }

    resetInventory(): void {
        this.inventories$.next([]);
    }

    setSelectedInventories(inventories: number[]): void {
        this.selectedInventories$.next(inventories);
    }

    clearSelectedInventories(): void {
        this.selectedInventories$.next([]);
    }

    reset(): void {
        this.searchParams$.next(null);
        this.resetInventory();
        this.clearSelectedInventories();
    }
}
