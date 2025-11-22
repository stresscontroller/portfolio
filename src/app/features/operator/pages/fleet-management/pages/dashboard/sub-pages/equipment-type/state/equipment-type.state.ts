import { Injectable, inject } from '@angular/core';
import {
    UIStatus,
    UserState,
    FleetManagementApiService,
    EquipmentTypeFieldListItem,
    EquipmentTypeDetailItem,
    EquipmentTypeListItem,
    EquipmentTypeConfig,
    UserManagementApiService,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Injectable()
export class EquipmentTypeState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);
    fleetManagementApiService = inject(FleetManagementApiService);
    equipmentTypeList$ = new BehaviorSubject<EquipmentTypeListItem[]>([]);
    equipmentTypeFieldList$ = new BehaviorSubject<EquipmentTypeFieldListItem[]>(
        []
    );
    equipmentTypeDetail$ = new BehaviorSubject<
        EquipmentTypeDetailItem | undefined
    >(undefined);

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
            this.loadEquipmentTypeFieldList();
            this.loadEquipmentTypeList(config.showInActive);
        });
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

    loadEquipmentTypeFieldList(): Promise<void> {
        this.status$.next('loading');
        this.equipmentTypeFieldList$.next([]);
        return lastValueFrom(
            this.fleetManagementApiService.loadEquipmentTypeFieldList()
        )
            .then((res) => {
                this.status$.next('success');
                this.equipmentTypeFieldList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    loadEquipmentTypeList(isShowInActive: boolean): Promise<void> {
        const companyId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyId) {
            return Promise.resolve();
        }
        this.status$.next('loading');
        this.equipmentTypeList$.next([]);
        return lastValueFrom(
            this.fleetManagementApiService.loadEquipmentTypeList(
                companyId,
                isShowInActive
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

    loadEquipmentTypeDetail(typeId: number): Promise<void> {
        this.equipmentTypeDetail$.next(undefined);
        return lastValueFrom(
            this.fleetManagementApiService.loadEquipmentTypeDetail(typeId)
        )
            .then((res) => {
                this.equipmentTypeDetail$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {});
    }

    saveEquipmentType(config: EquipmentTypeConfig): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return Promise.reject('missing companyUniqueId');
            }
            this.status$.next('loading');
            return lastValueFrom(
                this.fleetManagementApiService.saveEquipmentType({
                    ...config,
                    companyId: user.companyUniqueID,
                })
            )
                .then(() => {
                    this.refresh();
                    this.status$.next('success');
                    return Promise.resolve();
                })
                .catch(() => {
                    this.status$.next('error');
                    return Promise.resolve();
                });
        });
    }

    deleteEquipmentType(
        equipmentTypeId: number,
        isActive: boolean
    ): Promise<void> {
        return lastValueFrom(
            this.fleetManagementApiService.deleteEquipmentType(
                equipmentTypeId,
                isActive
            )
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.error);
            }
            this.refresh();
            return Promise.resolve();
        });
    }
}
