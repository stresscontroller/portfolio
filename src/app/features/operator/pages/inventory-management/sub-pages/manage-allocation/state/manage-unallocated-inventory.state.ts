import { Injectable, inject } from '@angular/core';
import {
    InventoryManagementApiService,
    UnallocatedTourInventoryItemForm,
    UserState,
} from '@app/core';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ManageUnallocationState {
    inventoryManagementApiService = inject(InventoryManagementApiService);
    userState = inject(UserState);

    saveUnallocatedTourInventory(config: UnallocatedTourInventoryItemForm) {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.b2CUserId) {
                return Promise.reject('missing userid');
            }
            return lastValueFrom(
                this.inventoryManagementApiService.saveUnallocatedTourInventory(
                    {
                        ...config,
                        unallocatedTourInventoryID: 0,
                        recurranceId: 0,
                        createdBy: user.b2CUserId,
                        companyId: user.companyUniqueID ?? '',
                    }
                )
            );
        });
    }
}
