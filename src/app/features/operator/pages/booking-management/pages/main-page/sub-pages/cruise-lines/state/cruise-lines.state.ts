import { Injectable, inject } from '@angular/core';
import {
    UIStatus,
    UserState,
    CruiseLineListItem,
    CruiseLineDetails,
    CruiseLineConfig,
    CruiseLineTourListItem,
    CruiseLineTourConfig,
    CruiseLineTourNameCodeConfig,
    TourServiceListItem,
    CruiseShipListItem,
    CruiseShipDetails,
    CruiseShipScheduleListItem,
    Port,
    CruiseShipScheduleConfig,
    UserManagementApiService,
    BookingManagementApiService,
    OperatorFiltersState,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

@Injectable()
export class CruiseLinesState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);
    bookingManagementApiService = inject(BookingManagementApiService);
    operatorFiltersState = inject(OperatorFiltersState);
    cruiseLineList$ = new BehaviorSubject<CruiseLineListItem[]>([]);
    tourServiceList$ = new BehaviorSubject<TourServiceListItem[]>([]);
    cruiseLineDetails$ = new BehaviorSubject<CruiseLineDetails | undefined>(
        undefined
    );
    cruiseLineTourList$ = new BehaviorSubject<CruiseLineTourListItem[]>([]);
    cruiseShipList$ = new BehaviorSubject<CruiseShipListItem[]>([]);
    cruiseShipDetails$ = new BehaviorSubject<CruiseShipDetails | undefined>(
        undefined
    );
    shipScheduleList$ = new BehaviorSubject<CruiseShipScheduleListItem[]>([]);
    ports$ = new BehaviorSubject<Port[]>([]);
    shipCompanyId: number = 0;

    status$ = new BehaviorSubject<{
        loadCruiseLineList: UIStatus;
        loadCruiseLineTourList: UIStatus;
        loadToursServices: UIStatus;
        loadCruiseShipList: UIStatus;
        loadShipScheduleList: UIStatus;
    }>({
        loadCruiseLineList: 'idle',
        loadCruiseLineTourList: 'idle',
        loadToursServices: 'idle',
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
            this.loadCruiseLineList(config.showInActive);
        });
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

    loadCruiseLineList(isShowInActive: boolean): Promise<void> {
        const companyId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyId) {
            return Promise.resolve();
        }
        this.updateIsStatus('loadCruiseLineList', 'loading');
        this.cruiseLineList$.next([]);
        return lastValueFrom(
            this.bookingManagementApiService.loadCruiseLineList(
                companyId,
                isShowInActive
            )
        )
            .then((res) => {
                this.updateIsStatus('loadCruiseLineList', 'success');
                this.cruiseLineList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.updateIsStatus('loadCruiseLineList', 'error');
            });
    }

    loadCruiseLineDetails(shipCompanyId: number): Promise<void> {
        this.cruiseLineDetails$.next(undefined);
        return lastValueFrom(
            this.bookingManagementApiService.loadCruiseLineDetails(
                shipCompanyId
            )
        )
            .then((res) => {
                this.cruiseLineDetails$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {});
    }

    saveCruiseLine(config: CruiseLineConfig, image?: File): Promise<void> {
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    return Promise.reject('missing user information');
                }
                const formData = new FormData();
                formData.append('ShipCompanyId', String(config.shipCompanyId));
                formData.append('ShipCompanyName', config.shipCompanyName);
                formData.append(
                    'ShipCompanyAddress',
                    config.shipCompanyAddress ?? ''
                );
                formData.append('IsLive', String(config.isLive ?? false));
                formData.append(
                    'ShipCompanyColor',
                    config.shipCompanyColor ?? ''
                );
                formData.append(
                    'ShipCompanyBackgroundColor',
                    config.shipCompanyBackgroundColor ?? ''
                );
                formData.append('InvMgrFname', config.invMgrFname ?? '');
                formData.append('InvMgrLname', config.invMgrLname ?? '');
                formData.append('InvMgrEmail', config.invMgrEmail ?? '');
                formData.append('InvMgrPhone', config.invMgrPhone ?? '');
                if (image) {
                    formData.append('ShipCompanyLogo', image, image.name);
                    formData.append('ShipCompanyLogoPath', image.name);
                }
                formData.append('CreatedBy', '');
                formData.append('CompanyId', user.companyUniqueID);
                return lastValueFrom(
                    this.bookingManagementApiService.saveCruiseLine(formData)
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

    loadTourServiceList(shipCompanyId: number): Promise<void> {
        const companyId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyId) {
            return Promise.resolve();
        }
        this.updateIsStatus('loadToursServices', 'loading');
        this.tourServiceList$.next([]);
        return lastValueFrom(
            this.bookingManagementApiService.loadTourServiceList(
                companyId,
                shipCompanyId
            )
        )
            .then((res) => {
                this.tourServiceList$.next(res.data);
                this.updateIsStatus('loadToursServices', 'success');
                return Promise.resolve();
            })
            .catch(() => {
                this.updateIsStatus('loadToursServices', 'error');
            });
    }

    loadCruiseShipList(isShowInActive: boolean, shipCompanyId: number) {
        const companyId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyId) {
            return Promise.resolve();
        }
        this.shipCompanyId = shipCompanyId;
        this.updateIsStatus('loadCruiseShipList', 'loading');
        this.cruiseShipList$.next([]);
        return lastValueFrom(
            this.bookingManagementApiService.loadCruiseShipList(
                companyId,
                isShowInActive,
                this.shipCompanyId
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

    deleteCruiseShip(id: number, isActive: boolean): Promise<void> {
        return lastValueFrom(
            this.bookingManagementApiService.deleteCruiseShip(id, isActive)
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.errors);
            }
            this.loadCruiseShipList(false, this.shipCompanyId);
            return Promise.resolve();
        });
    }

    updateCruiseLineTourNameCode(
        config: CruiseLineTourNameCodeConfig
    ): Promise<void> {
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    return Promise.reject('missing user information');
                }
                return lastValueFrom(
                    this.bookingManagementApiService.updateCruiseLineTour_Code({
                        ...config,
                        companyId: user.companyUniqueID,
                    })
                );
            })
            .then((res) => {
                if (res.success) {
                    return Promise.resolve();
                }
                return Promise.reject(res.errors);
            });
    }

    updateCruiseLineTour(config: CruiseLineTourConfig): Promise<void> {
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    return Promise.reject('missing user information');
                }
                return lastValueFrom(
                    this.bookingManagementApiService.updateCruiseLineTour({
                        ...config,
                        companyId: user.companyUniqueID,
                    })
                );
            })
            .then((res) => {
                if (res.success) {
                    return Promise.resolve();
                }
                return Promise.reject(res.errors);
            });
    }

    loadCruiseLineTourList(shipCompanyId: number): Promise<void> {
        const companyId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyId) {
            return Promise.resolve();
        }
        this.cruiseLineTourList$.next([]);
        this.updateIsStatus('loadCruiseLineTourList', 'loading');
        return lastValueFrom(
            this.bookingManagementApiService.loadCruiseLineTourList(
                companyId,
                shipCompanyId
            )
        )
            .then((res) => {
                this.updateIsStatus('loadCruiseLineTourList', 'success');
                this.cruiseLineTourList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.updateIsStatus('loadCruiseLineTourList', 'error');
            });
    }

    deleteCruiseLine(id: number, isActive: boolean): Promise<void> {
        return lastValueFrom(
            this.bookingManagementApiService.deleteCruiseLine(id, isActive)
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.errors);
            }
            return Promise.resolve();
        });
    }

    loadShipScheduleList(shipCompanyId: number): Promise<void> {
        const companyId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyId) {
            return Promise.resolve();
        }
        if (shipCompanyId != 0) {
            this.shipCompanyId = shipCompanyId;
        }
        this.updateIsStatus('loadShipScheduleList', 'loading');
        this.shipScheduleList$.next([]);
        return lastValueFrom(
            this.bookingManagementApiService.loadLineShipScheduleList(
                companyId,
                this.shipCompanyId
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
                    this.loadShipScheduleList(0);
                    return Promise.resolve();
                }
                return Promise.reject(res.errors);
            });
    }

    loadPorts(): void {
        this.operatorFiltersState.getPorts().then((ports) => {
            this.ports$.next(ports);
        });
    }

    private updateIsStatus(
        key:
            | 'loadCruiseLineList'
            | 'loadCruiseLineTourList'
            | 'loadToursServices'
            | 'loadCruiseShipList'
            | 'loadShipScheduleList',
        status: string
    ): void {
        this.status$.next({
            ...this.status$.getValue(),
            [key]: status,
        });
    }
}
