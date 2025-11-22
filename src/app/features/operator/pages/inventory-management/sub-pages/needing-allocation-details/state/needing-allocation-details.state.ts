import { Injectable, inject } from '@angular/core';
import { UserActionsState } from '../../../../tour-dispatch/state';
import {
    CruiseCalendarApiService,
    CruiseEvents,
    ErrorDialogMessages,
    InventoryManagementApiService,
    NeededAllocationTourInventoryDetailFilters,
    TourInventoryItem,
    UserState,
    UIState,
} from '@app/core';
import {
    BehaviorSubject,
    catchError,
    combineLatest,
    distinctUntilChanged,
    filter,
    from,
    lastValueFrom,
    map,
    of,
    switchMap,
    tap,
} from 'rxjs';
import { formatDate } from '@angular/common';
interface CalendarConfig {
    date: Date;
    tourId: string;
    portId: number;
}
type Status = 'idle' | 'loading' | 'success' | 'error';
@Injectable()
export class NeedingAllocationDetailsState {
    userActionsState = inject(UserActionsState);
    userState = inject(UserState);
    uiState = inject(UIState);
    inventoryManagementApiService = inject(InventoryManagementApiService);
    cruiseCalendarApiService = inject(CruiseCalendarApiService);

    refreshTriggered$ = new BehaviorSubject<number>(0);

    needingAllocationDetailsInventories$ = new BehaviorSubject<{
        config: NeededAllocationTourInventoryDetailFilters | null;
        data: TourInventoryItem[];
    }>({
        config: null,
        data: [],
    });

    status$ = new BehaviorSubject<{
        loadNeedingAllocationDetails: Status;
        loadCalendar: Status;
        submitAllocateAndRelease: Status;
    }>({
        loadNeedingAllocationDetails: 'idle',
        loadCalendar: 'idle',
        submitAllocateAndRelease: 'idle',
    });

    calendar$ = new BehaviorSubject<{
        config: { tourId: string[]; startDate: Date };
        tourInventories: TourInventoryItem[];
        ships: CruiseEvents[];
    } | null>(null);

    calendarConfig$ = new BehaviorSubject<CalendarConfig | null>(null);

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.initNeedingAllocationDetailsInventories();
        this.initCalendar();
    }

    setCalendarConfig(config: CalendarConfig): void {
        this.calendarConfig$.next(config);
    }

    initCalendar(): void {
        this.calendarConfig$
            .pipe(
                filter((config) => !!config),
                map((config) => config as CalendarConfig),
                switchMap((config) => {
                    return this.refreshTriggered$.pipe(
                        distinctUntilChanged(),
                        map(() => config)
                    );
                })
            )
            .subscribe((config) => {
                this.loadCalendar(config.date, config.tourId, config.portId);
            });
    }

    loadCalendar(
        date: Date,
        tourId: string,
        portId: number
    ): Promise<
        | {
              config: { tourId: string[]; startDate: Date };
              tourInventories: TourInventoryItem[];
              ships: CruiseEvents[];
          }
        | undefined
    > {
        this.status$.next({
            ...this.status$.getValue(),
            loadCalendar: 'loading',
        });
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return Promise.reject('missing companyUniqueId');
            }
            const formattedDate = formatDate(date, 'YYYY-MM-dd', 'en-US');
            return lastValueFrom(
                combineLatest([
                    this.inventoryManagementApiService.getAllocationUnallocatedTourInventoryList(
                        {
                            searchType: 'ALL',
                            shipCompanyId: null,
                            shipId: null,
                            tourId: [tourId],
                            portId: 0,
                            isActive: true,
                            startDate: formattedDate,
                            endDate: formattedDate,
                            companyId: user.companyUniqueID,
                        }
                    ),
                    this.cruiseCalendarApiService.loadCruiseScheduleCalendar(
                        user.companyUniqueID,
                        formattedDate,
                        formattedDate,
                        portId || null,
                        true
                    ),
                ]).pipe(
                    map(([tourInventories, ships]) => {
                        return {
                            config: {
                                tourId: [tourId],
                                startDate: date,
                            },
                            tourInventories:
                                tourInventories.data.map((tourInventory) => {
                                    return {
                                        ...tourInventory,
                                        extras: {
                                            seatsSold:
                                                tourInventory.seatsSold || 0,
                                            seatsAllocated:
                                                tourInventory.totalUnallocatedSeatTour ||
                                                0,
                                        },
                                    };
                                }) || [],
                            ships: ships.data || [],
                        };
                    })
                )
            )
                .then((res) => {
                    this.status$.next({
                        ...this.status$.getValue(),
                        loadCalendar: 'success',
                    });
                    this.calendar$.next(res);
                    return res;
                })
                .catch((err) => {
                    this.uiState.openErrorDialog({
                        title: err.errorTitle
                            ? err.errorTitle
                            : ErrorDialogMessages.inventoryManagement
                                  .allocationNotFound.title,
                        description: err.errors[0]
                            ? err.errors[0]
                            : ErrorDialogMessages.inventoryManagement
                                  .allocationNotFound.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.inventoryManagement
                                    .allocationNotFound.buttons.close,
                                isPrimary: true,
                                onClick: () => {
                                    // do nothing
                                },
                            },
                        ],
                    });
                    this.status$.next({
                        ...this.status$.getValue(),
                        loadCalendar: 'error',
                    });
                    return undefined;
                });
        });
    }

    refreshInventories(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    private initNeedingAllocationDetailsInventories(): void {
        this.userState.aspNetUser$
            .pipe(
                filter((user) => !!user),
                distinctUntilChanged(),
                switchMap(() => {
                    return combineLatest([
                        this.needingAllocationDetailsInventories$.pipe(
                            map(
                                (needingAllocationDetailsInventories) =>
                                    needingAllocationDetailsInventories.config
                            )
                        ),
                        this.refreshTriggered$,
                    ]).pipe(
                        distinctUntilChanged(
                            (
                                [previousConfig, previousRefreshTriggered],
                                [currentConfig, currentRefreshTriggered]
                            ) => {
                                return (
                                    previousRefreshTriggered ===
                                        currentRefreshTriggered &&
                                    JSON.stringify(previousConfig) ===
                                        JSON.stringify(currentConfig)
                                );
                            }
                        ),
                        map(([config]) => config),
                        filter((config) => !!config),
                        map(
                            (config) =>
                                config as NeededAllocationTourInventoryDetailFilters
                        ),
                        switchMap((config) => {
                            return from(
                                this.getNeededAllocationDetailsTourInventoryList(
                                    config
                                )
                            );
                        })
                    );
                })
            )
            .subscribe();
    }

    updateNeedingDetailsAllocationConfig(
        config: NeededAllocationTourInventoryDetailFilters
    ): void {
        this.needingAllocationDetailsInventories$.next({
            ...this.needingAllocationDetailsInventories$.getValue(),
            config: config,
            data: [],
        });
    }

    getNeededAllocationDetailsTourInventoryList(
        config: NeededAllocationTourInventoryDetailFilters
    ): Promise<TourInventoryItem[]> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return Promise.reject('missing companyUniqueId');
            }
            this.status$.next({
                ...this.status$.getValue(),
                loadNeedingAllocationDetails: 'loading',
            });
            this.needingAllocationDetailsInventories$.next({
                ...this.needingAllocationDetailsInventories$.getValue(),
                data: [],
            });
            return lastValueFrom(
                this.inventoryManagementApiService
                    .getAllocationUnallocatedTourInventoryList({
                        searchType: 'ALL',
                        companyId: user.companyUniqueID,
                        tourId: config.tourId != null ? [config.tourId] : [''],
                        shipId: null,
                        shipCompanyId: null,
                        portId: config.portId || null,
                        isActive: true,
                        startDate: config.startDate,
                        endDate: config.startDate,
                    })
                    .pipe(
                        tap((needingInventories) => {
                            // Filter out the released ones here
                            const filteredArray =
                                needingInventories?.data.filter(
                                    (obj) =>
                                        obj.isReleased == false &&
                                        (obj.shipId === null ||
                                            (config.shipId &&
                                                obj.shipId ===
                                                    parseInt(config.shipId)))
                                );

                            this.needingAllocationDetailsInventories$.next({
                                config: this.needingAllocationDetailsInventories$.getValue()
                                    .config,
                                data: filteredArray || [],
                            });
                            this.status$.next({
                                ...this.status$.getValue(),
                                loadNeedingAllocationDetails: 'success',
                            });
                        }),
                        catchError((error) => {
                            this.uiState.openErrorDialog({
                                title: error.errorTitle
                                    ? error.errorTitle
                                    : ErrorDialogMessages.inventoryManagement
                                          .allocationNotFound.title,
                                description:
                                    error?.errors &&
                                    Array.isArray(error.errors) &&
                                    error.errors.length > 0
                                        ? error.errors[0]
                                        : ErrorDialogMessages
                                              .inventoryManagement
                                              .allocationNotFound.description,
                                buttons: [
                                    {
                                        text: ErrorDialogMessages
                                            .inventoryManagement
                                            .allocationNotFound.buttons.close,
                                        isPrimary: true,
                                        onClick: () => {
                                            // do nothing
                                        },
                                    },
                                ],
                            });
                            this.needingAllocationDetailsInventories$.next({
                                ...this.needingAllocationDetailsInventories$.getValue(),
                                data: [],
                            });
                            this.status$.next({
                                ...this.status$.getValue(),
                                loadNeedingAllocationDetails: 'error',
                            });
                            return of(error);
                        })
                    )
            );
        });
    }

    saveReleaseInventory(
        ids: string[],
        shipId: string,
        shipCompanyId: number
    ): Promise<string> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing user id');
            }
            const userId = user.id;
            this.status$.next({
                ...this.status$.getValue(),
                submitAllocateAndRelease: 'loading',
            });
            return lastValueFrom(
                this.inventoryManagementApiService
                    .saveAllocated({
                        // we need to send -1 for shipCompanyId and shipId for book directs instead of 0, but we're using shipCompanyId 0 for other filters
                        // we should look into refactoring how this is handled in the future
                        shipCompanyId:
                            shipCompanyId === null || shipCompanyId === 0
                                ? -1
                                : shipCompanyId,
                        shipId:
                            shipCompanyId === null || shipCompanyId === 0
                                ? -1
                                : +shipId,
                        ids: ids.join(','),
                        userId: userId,
                    })
                    .pipe(
                        switchMap((result) => {
                            if (result.success == true) {
                                return this.inventoryManagementApiService.saveReleaseInventory(
                                    userId,
                                    ids.join(',')
                                );
                            } else {
                                throw 'bad';
                            }
                        }),
                        tap(() => {
                            this.status$.next({
                                ...this.status$.getValue(),
                                submitAllocateAndRelease: 'success',
                            });

                            this.refreshInventories();
                        }),
                        catchError((error) => {
                            this.uiState.openErrorDialog({
                                title: error.errorTitle
                                    ? error.errorTitle
                                    : ErrorDialogMessages.inventoryManagement
                                          .allocationNotFound.title,
                                description:
                                    error?.errors &&
                                    Array.isArray(error.errors) &&
                                    error.errors.length > 0
                                        ? error.errors[0]
                                        : ErrorDialogMessages
                                              .inventoryManagement
                                              .allocationNotFound.description,
                                buttons: [
                                    {
                                        text: ErrorDialogMessages
                                            .inventoryManagement
                                            .allocationNotFound.buttons.close,
                                        isPrimary: true,
                                        onClick: () => {
                                            // do nothing
                                        },
                                    },
                                ],
                            });
                            this.status$.next({
                                ...this.status$.getValue(),
                                submitAllocateAndRelease: 'error',
                            });
                            return of(error);
                        })
                    )
            );
        });
    }
}
