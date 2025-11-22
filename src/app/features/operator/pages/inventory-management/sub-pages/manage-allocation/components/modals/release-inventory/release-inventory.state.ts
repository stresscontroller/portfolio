import { Injectable, inject } from '@angular/core';
import {
    AllocationReleaseTourSearch,
    InventoryManagementApiService,
    ReleaseInventoryListItem,
    UserState,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, map, tap } from 'rxjs';

@Injectable()
export class ReleaseInventoryState {
    inventoryManagementApiService = inject(InventoryManagementApiService);
    userState = inject(UserState);
    inventory$ = new BehaviorSubject<ReleaseInventoryListItem[]>([]);

    searchInventory(
        config: Omit<AllocationReleaseTourSearch, 'companyId'>
    ): Promise<ReleaseInventoryListItem[]> {
        this.inventory$.next([]);
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return Promise.reject('missing companyUniqueId');
            }
            return lastValueFrom(
                this.inventoryManagementApiService
                    .getReleaseAllInventory({
                        ...config,
                        companyId: user.companyUniqueID,
                    })
                    .pipe(
                        map((data) => data?.data),
                        tap((inventories) => {
                            this.inventory$.next(inventories);
                        })
                    )
            );
        });
    }

    saveReleaseInventory(ids: number[]) {
        return this.userState.getAspNetUser().then((userDetails) => {
            if (!userDetails?.id) {
                return Promise.reject('missing userid');
            }
            return lastValueFrom(
                this.inventoryManagementApiService.saveReleaseInventory(
                    userDetails.id,
                    ids.join(',')
                )
            );
        });
    }

    resetInventory(): void {
        this.inventory$.next([]);
    }
}
