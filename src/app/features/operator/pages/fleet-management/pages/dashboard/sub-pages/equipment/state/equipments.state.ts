import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import {
    UIStatus,
    UserState,
    EquipmentTypeListItem,
    LocationData,
    EquipmentListItem,
    EquipmentConfig,
    UserManagementApiService,
    FleetManagementApiService,
} from '@app/core';

@Injectable()
export class EquipmentsState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);
    fleetManagementApiService = inject(FleetManagementApiService);
    locations$ = new BehaviorSubject<LocationData[]>([]);
    equipmentTypeList$ = new BehaviorSubject<EquipmentTypeListItem[]>([]);
    equipmentList$ = new BehaviorSubject<EquipmentListItem[]>([]);

    status$ = new BehaviorSubject<UIStatus>('idle');
    config$ = new BehaviorSubject<{
        showInActive: boolean;
        refreshTriggered: number;
    }>({
        showInActive: false,
        refreshTriggered: 0,
    });

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.config$.subscribe((config) => {
            this.loadEquipmentList(config.showInActive);
        });
        this.loadEquipmentTypeList();
        this.loadLocations();
    }

    refresh(): void {
        this.config$.next({
            ...this.config$.getValue(),
            refreshTriggered: new Date().getTime(),
        });
    }

    setShowInactive(showInActive: boolean): void {
        this.config$.next({
            ...this.config$.getValue(),
            showInActive,
        });
    }

    loadEquipmentTypeList(): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID ?? '';
        this.equipmentTypeList$.next([]);
        return lastValueFrom(
            this.fleetManagementApiService.loadEquipmentTypeList(
                companyID,
                true
            )
        ).then((res) => {
            this.equipmentTypeList$.next(res.data);
            return Promise.resolve();
        });
    }

    loadLocations(): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID ?? '';
        this.locations$.next([]);
        return lastValueFrom(
            this.userManagementApiService.loadLocationDataByType(
                companyID,
                'Equipment'
            )
        ).then((res) => {
            this.locations$.next(res.data);
            return Promise.resolve();
        });
    }

    loadEquipmentList(showInActive: boolean): Promise<void> {
        this.status$.next('loading');
        this.equipmentList$.next([]);
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (user?.companyUniqueID) {
                    return lastValueFrom(
                        this.fleetManagementApiService.loadEquipmentList(
                            user.companyUniqueID,
                            showInActive
                        )
                    ).then((res) => {
                        return Promise.resolve(res.data);
                    });
                }
                return Promise.reject('No companyUniqueID');
            })
            .then((tours) => {
                this.equipmentList$.next(tours || []);
                this.status$.next('success');
            })
            .catch(() => {
                return Promise.resolve();
            });
    }

    saveEquipment(config: EquipmentConfig): Promise<void> {
        this.status$.next('loading');
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
                        this.status$.next('success');
                        return Promise.resolve();
                    } else {
                        return Promise.reject(res.error);
                    }
                })
                .catch(() => {
                    this.status$.next('error');
                });
        });
    }

    deleteEquipment(equipmentID: number, isActive: boolean): Promise<void> {
        this.status$.next('loading');
        return lastValueFrom(
            this.fleetManagementApiService.deleteEquipment(
                equipmentID,
                isActive
            )
        ).then((res) => {
            if (!res.success) {
                this.status$.next('error');
                return Promise.reject(res.error);
            }
            this.refresh();
            this.status$.next('success');
            return Promise.resolve();
        });
    }
}
