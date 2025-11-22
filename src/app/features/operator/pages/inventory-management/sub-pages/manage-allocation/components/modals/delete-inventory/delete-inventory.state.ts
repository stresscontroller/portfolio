import { Injectable, inject } from '@angular/core';
import {
    InventoryManagementApiService,
    TourInventoryItem,
    UserState,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, tap } from 'rxjs';
import { AllocationDeleteSearch } from '../../../../../models';

@Injectable()
export class DeleteInventoryState {
    inventoryManagementApiService = inject(InventoryManagementApiService);
    userState = inject(UserState);
    inventory$ = new BehaviorSubject<TourInventoryItem[]>([]);

    searchInventory(config: AllocationDeleteSearch & { tourId: number }) {
        this.inventory$.next([]);
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
                            this.inventory$.next(res.data);
                        })
                    )
            );
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
        this.inventory$.next([]);
    }
}
