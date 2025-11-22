import { Injectable, inject } from '@angular/core';
import {
    UIStatus,
    UserState,
    UserManagementApiService,
    CruiseShipListItem,
    CruiseShipDetails,
    UpcomingShipScheduleConfig,
    UpcomingShipScheduleListItem,
    CruiseLineListItem,
    CruiseShipConfig,
    BookingManagementApiService,
    Port,
    OperatorFiltersState,
    CruiseShipScheduleConfig,
    CruiseShipScheduleListItem,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Injectable()
export class CruiseShipsState {
    userState = inject(UserState);
    operatorFiltersState = inject(OperatorFiltersState);
    userManagementApiService = inject(UserManagementApiService);
    bookingManagementApiService = inject(BookingManagementApiService);
    cruiseShipList$ = new BehaviorSubject<CruiseShipListItem[]>([]);
    cruiseLineList$ = new BehaviorSubject<CruiseLineListItem[]>([]);
    upcomingShipScheduleList$ = new BehaviorSubject<
        UpcomingShipScheduleListItem[]
    >([]);
    cruiseShipDetails$ = new BehaviorSubject<CruiseShipDetails | undefined>(
        undefined
    );
    shipScheduleList$ = new BehaviorSubject<CruiseShipScheduleListItem[]>([]);
    ports$ = new BehaviorSubject<Port[]>([]);

    dataSource$ = new BehaviorSubject<string>('');
    shipId$ = new BehaviorSubject<number>(0);
    shipCompanyId: number = 0;
    fromDate: string = '';
    toDate: string = '';

    status$ = new BehaviorSubject<{
        loadCruiseShipList: UIStatus;
        loadShipScheduleList: UIStatus;
    }>({
        loadCruiseShipList: 'idle',
        loadShipScheduleList: 'idle',
    });

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
            this.loadCruiseShipList(config.showInActive);
        });
        this.loadCruiseLineList();
        this.loadPorts();
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

    loadCruiseShipList(isShowInActive: boolean): Promise<void> {
        const companyId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyId) {
            return Promise.resolve();
        }
        this.updateIsStatus('loadCruiseShipList', 'loading');
        this.cruiseShipList$.next([]);
        return lastValueFrom(
            this.bookingManagementApiService.loadCruiseShipList(
                companyId,
                isShowInActive
            )
        )
            .then((res) => {
                this.updateIsStatus('loadCruiseShipList', 'success');
                this.cruiseShipList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.updateIsStatus('loadCruiseShipList', 'error');
            });
    }

    loadUpcomingShipScheduleList(
        shipId: number,
        fromDate: string,
        toDate: string
    ) {
        const companyId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyId) {
            return Promise.resolve();
        }
        this.upcomingShipScheduleList$.next([]);
        const config: UpcomingShipScheduleConfig = {
            shipId,
            companyId,
            startDate: fromDate,
            endDate: toDate,
        };
        return lastValueFrom(
            this.bookingManagementApiService.loadUpcomingShipScheduleList(
                config
            )
        )
            .then((res) => {
                this.upcomingShipScheduleList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {});
    }

    loadCruiseLineList(): Promise<void> {
        const companyId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyId) {
            return Promise.resolve();
        }
        this.cruiseLineList$.next([]);
        return lastValueFrom(
            this.bookingManagementApiService.loadCruiseLineList(companyId)
        )
            .then((res) => {
                this.cruiseLineList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {});
    }

    loadCruiseShipDetails(shipId: number): Promise<void> {
        this.cruiseShipDetails$.next(undefined);
        return lastValueFrom(
            this.bookingManagementApiService.loadCruiseShipDetails(shipId)
        )
            .then((res) => {
                this.cruiseShipDetails$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {});
    }

    loadPorts(): void {
        this.operatorFiltersState.getPorts().then((ports) => {
            this.ports$.next(ports);
        });
    }

    saveCruiseShip(config: CruiseShipConfig): Promise<void> {
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    return Promise.reject('missing user information');
                }
                return lastValueFrom(
                    this.bookingManagementApiService.saveCruiseShip({
                        ...config,
                        companyId: user.companyUniqueID,
                    })
                );
            })
            .then((res) => {
                if (res.success) {
                    this.refresh();
                    return Promise.resolve();
                }
                return Promise.reject(res.errors);
            });
    }

    deleteCruiseShip(id: number, isActive: boolean): Promise<void> {
        return lastValueFrom(
            this.bookingManagementApiService.deleteCruiseShip(id, isActive)
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.errors);
            }
            return Promise.resolve();
        });
    }

    loadShipScheduleList(
        shipCompanyId: number,
        cruiseStartsOn: string,
        cruiseEndsOn: string
    ) {
        const companyId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyId) {
            return Promise.resolve();
        }
        if (shipCompanyId != 0) {
            this.shipCompanyId = shipCompanyId;
        }
        this.fromDate = cruiseStartsOn;
        this.toDate = cruiseEndsOn;
        this.updateIsStatus('loadShipScheduleList', 'loading');
        this.shipScheduleList$.next([]);
        return lastValueFrom(
            this.bookingManagementApiService.loadShipScheduleList(
                this.shipCompanyId,
                companyId,
                cruiseStartsOn,
                cruiseEndsOn
            )
        )
            .then((res) => {
                this.updateIsStatus('loadShipScheduleList', 'success');
                this.shipScheduleList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.updateIsStatus('loadShipScheduleList', 'error');
            });
    }

    saveShipSchedule(config: CruiseShipScheduleConfig): Promise<void> {
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    return Promise.reject('missing user information');
                }
                return lastValueFrom(
                    this.bookingManagementApiService.saveShipSchedule({
                        ...config,
                        companyId: user.companyUniqueID,
                    })
                );
            })
            .then((res) => {
                if (res.success) {
                    this.loadShipScheduleList(0, this.fromDate, this.toDate);
                    return Promise.resolve();
                }
                return Promise.reject(res.errors);
            });
    }

    deleteShipSchedule(id: number, isActive: boolean): Promise<void> {
        return lastValueFrom(
            this.bookingManagementApiService.deleteShipSchedule(id, isActive)
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.errors);
            }
            this.loadShipScheduleList(0, this.fromDate, this.toDate);
            return Promise.resolve();
        });
    }

    private updateIsStatus(
        key: 'loadCruiseShipList' | 'loadShipScheduleList',
        status: string
    ): void {
        this.status$.next({
            ...this.status$.getValue(),
            [key]: status,
        });
    }
}
