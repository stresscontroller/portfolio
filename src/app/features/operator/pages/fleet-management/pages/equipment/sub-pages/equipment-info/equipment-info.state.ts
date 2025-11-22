import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom, map, switchMap } from 'rxjs';

import {
    UIState,
    UIStatus,
    UserState,
    LocationData,
    EquipmentTypeListItem,
    EquipmentDetail,
    EquipmentConfig,
    UserManagementApiService,
    FleetManagementApiService,
} from '@app/core';
import { EquipmentState } from '../../state';

@Injectable()
export class EquipmentInfoState {
    uiState = inject(UIState);
    userState = inject(UserState);
    equipmentState = inject(EquipmentState);
    userManagementApiService = inject(UserManagementApiService);
    fleetManagementApiService = inject(FleetManagementApiService);
    locations$ = new BehaviorSubject<LocationData[]>([]);
    equipmentTypeList$ = new BehaviorSubject<EquipmentTypeListItem[]>([]);
    equipmentDetail$ = new BehaviorSubject<EquipmentDetail | undefined>(
        undefined
    );

    status$ = new BehaviorSubject<{
        loadEquipmentType: UIStatus;
        loadLocations: UIStatus;
        loadEquipmentDetail: UIStatus;
        saveEquipmentDetail: UIStatus;
    }>({
        loadEquipmentType: 'idle',
        loadLocations: 'idle',
        loadEquipmentDetail: 'idle',
        saveEquipmentDetail: 'idle',
    });

    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.equipmentState.equipmentId$
            .pipe(
                switchMap((equipmentId) =>
                    this.refreshTriggered$.pipe(map(() => equipmentId))
                )
            )
            .subscribe((equipmentId) => {
                this.equipmentDetail$.next(undefined);
                if (equipmentId) {
                    this.loadEquipmentDetail(equipmentId);
                }
            });
        this.loadEquipmentTypeList();
        this.loadLocations();
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    loadEquipmentTypeList(): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID ?? '';
        this.updateStatus('loadEquipmentType', 'loading');
        this.equipmentTypeList$.next([]);
        return lastValueFrom(
            this.fleetManagementApiService.loadEquipmentTypeList(
                companyID,
                true
            )
        )
            .then((res) => {
                this.updateStatus('loadEquipmentType', 'success');
                this.equipmentTypeList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.updateStatus('loadEquipmentType', 'error');
            });
    }

    loadLocations(): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID ?? '';
        this.updateStatus('loadLocations', 'loading');
        this.locations$.next([]);
        return lastValueFrom(
            this.userManagementApiService.loadLocationDataByType(
                companyID,
                'Equipment'
            )
        )
            .then((res) => {
                this.updateStatus('loadLocations', 'success');
                this.locations$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.updateStatus('loadLocations', 'error');
            });
    }

    loadEquipmentDetail(equipmentId: string): Promise<void> {
        this.updateStatus('loadEquipmentDetail', 'loading');
        this.equipmentDetail$.next(undefined);
        return lastValueFrom(
            this.fleetManagementApiService.loadEquipmentDetail(equipmentId)
        )
            .then((res) => {
                this.updateStatus('loadEquipmentDetail', 'success');
                this.equipmentDetail$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.updateStatus('loadEquipmentDetail', 'error');
            });
    }

    saveEquipment(config: EquipmentConfig): Promise<void> {
        this.updateStatus('saveEquipmentDetail', 'loading');
        return this.userState.getAspNetUser().then((user) => {
            return lastValueFrom(
                this.fleetManagementApiService.saveEquipment({
                    ...config,
                    companyId: user?.companyUniqueID ?? '',
                })
            )
                .then((res) => {
                    if (res.success) {
                        this.refresh();
                        this.updateStatus('saveEquipmentDetail', 'success');
                        return Promise.resolve();
                    } else {
                        return Promise.reject(res.error);
                    }
                })
                .catch(() => {
                    this.updateStatus('saveEquipmentDetail', 'error');
                });
        });
    }

    private updateStatus(
        key:
            | 'loadEquipmentType'
            | 'loadLocations'
            | 'loadEquipmentDetail'
            | 'saveEquipmentDetail',
        status: string
    ): void {
        this.status$.next({
            ...this.status$.getValue(),
            [key]: status,
        });
    }
}
