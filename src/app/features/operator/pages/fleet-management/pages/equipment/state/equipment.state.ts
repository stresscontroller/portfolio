import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom, switchMap, tap } from 'rxjs';
import {
    UIStatus,
    UserState,
    EquipmentDetail,
    FleetManagementApiService,
} from '@app/core';

@Injectable()
export class EquipmentState {
    userState = inject(UserState);
    fleetManagementApiService = inject(FleetManagementApiService);
    equipmentId$ = new BehaviorSubject<string | undefined>(undefined);
    equipmentDetail$ = new BehaviorSubject<EquipmentDetail | undefined>(
        undefined
    );
    status$ = new BehaviorSubject<{
        loadEquipmentDetails: UIStatus;
    }>({
        loadEquipmentDetails: 'idle',
    });
    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;
    init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.equipmentId$
            .pipe(
                switchMap((equipmentId) => {
                    return this.refreshTriggered$.pipe(
                        tap(() => {
                            if (equipmentId) {
                                this.loadEquipmentDetail(equipmentId);
                            } else {
                                this.equipmentDetail$.next(undefined);
                            }
                        })
                    );
                })
            )
            .subscribe();
    }

    setEditEquipmentId(equipmentId: string): void {
        this.equipmentId$.next(equipmentId);
    }

    clearEditEquipmentId(): void {
        this.equipmentId$.next(undefined);
    }

    loadEquipmentDetail(equipmentId: string): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            loadEquipmentDetails: 'loading',
        });
        this.equipmentDetail$.next(undefined);
        return lastValueFrom(
            this.fleetManagementApiService.loadEquipmentDetail(equipmentId)
        )
            .then((res) => {
                return Promise.resolve(res.data);
            })
            .then((equipmentDetail) => {
                this.equipmentDetail$.next(equipmentDetail);
                this.status$.next({
                    ...this.status$.getValue(),
                    loadEquipmentDetails: 'success',
                });
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadEquipmentDetails: 'error',
                });
                return Promise.resolve();
            });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }
}
