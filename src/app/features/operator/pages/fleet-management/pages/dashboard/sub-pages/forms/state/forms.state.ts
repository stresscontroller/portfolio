import { Injectable, inject } from '@angular/core';
import {
    UserState,
    FleetManagementApiService,
    EquipmentTypeListItem,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { UIStatus } from '@app/core';

@Injectable()
export class FormsState {
    userState = inject(UserState);
    fleetManagementApiService = inject(FleetManagementApiService);
    equipmentTypeList$ = new BehaviorSubject<EquipmentTypeListItem[]>([]);
    status$ = new BehaviorSubject<UIStatus>('idle');
    private refreshTriggered$ = new BehaviorSubject<number>(0);

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.refreshTriggered$.subscribe(() => {
            this.userState.getAspNetUser().then((user) => {
                const companyId = user?.companyUniqueID ?? '';
                this.loadEquipmentTypeList(companyId);
            });
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    loadEquipmentTypeList(companyID: string): Promise<void> {
        this.status$.next('loading');
        this.equipmentTypeList$.next([]);
        return lastValueFrom(
            this.fleetManagementApiService.loadEquipmentTypeList(
                companyID,
                true
            )
        )
            .then((res) => {
                this.status$.next('success');
                this.equipmentTypeList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
