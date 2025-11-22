import { formatDate } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
    AllocationUnallocateTourSearch,
    AllocationUnallocatedTourInventoryListItem,
    CruiseCalendarApiService,
    CruiseEvents,
    ErrorDialogMessages,
    InventoryManagementApiService,
    OperatorFiltersState,
    TourInventoryItem,
    UIState,
    UserState,
    adjustDate,
} from '@app/core';
import { addMonths } from 'date-fns';
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

@Injectable()
export class ManageAllocationState {
    inventoryManagementApiService = inject(InventoryManagementApiService);
    cruiseCalendarApiService = inject(CruiseCalendarApiService);
    operatorFiltersState = inject(OperatorFiltersState);
    userState = inject(UserState);
    router = inject(Router);
    uiState = inject(UIState);
    manageAllocationInventories$ = new BehaviorSubject<{
        config: AllocationUnallocateTourSearch;
        status: 'idle' | 'loading' | 'success' | 'error';
        data: TourInventoryItem[];
        ships: CruiseEvents[];
        calendarCurrentViewDate: Date | undefined;
    }>({
        config: {
            companyId: '',
            searchType: 'ALL',
            shipCompanyId: null,
            shipId: null,
            tourId: [],
            portId: 0,
            isActive: true,
            startDate: formatDate(new Date(), 'YYYY-MM-dd', 'en-US'),
            endDate: formatDate(
                addMonths(new Date(), 1),
                'YYYY-MM-dd',
                'en-US'
            ),
        },
        status: 'idle',
        data: [],
        ships: [],
        calendarCurrentViewDate: new Date(),
    });
    unallocatedTourInventory$ = new BehaviorSubject<
        AllocationUnallocatedTourInventoryListItem[]
    >([]);

    private initialized = false;
    private reload$ = new BehaviorSubject<number>(0);
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.initManageAllocationInventories();
    }

    updateCalendarCurrentViewDate(date: Date | undefined): void {
        this.manageAllocationInventories$.next({
            ...this.manageAllocationInventories$.getValue(),
            calendarCurrentViewDate: date,
        });
    }

    reload(): void {
        this.reload$.next(new Date().getTime());
    }

    searchAllocations(filters: AllocationUnallocateTourSearch): void {
        const base64Filter = btoa(JSON.stringify(filters));
        const currentFilters = btoa(
            JSON.stringify(this.manageAllocationInventories$.getValue()?.config)
        );
        if (currentFilters === base64Filter) {
            this.reload();
        } else {
            this.router.navigate(
                ['/operator/inventory-management/manage-allocation'],
                {
                    queryParams: {
                        filters: base64Filter,
                    },
                }
            );
        }
    }
    private initManageAllocationInventories(): void {
        this.userState.aspNetUser$
            .pipe(
                filter((user) => !!user),
                distinctUntilChanged(),
                switchMap(() => {
                    return this.reload$.pipe(
                        switchMap(() => {
                            return this.manageAllocationInventories$.pipe(
                                map(
                                    (manageAllocationInventories) =>
                                        manageAllocationInventories.config
                                ),
                                distinctUntilChanged(),
                                switchMap((config) => {
                                    this.manageAllocationInventories$.next({
                                        ...this.manageAllocationInventories$.getValue(),
                                        status: 'loading',
                                        data: [],
                                    });
                                    return from(
                                        this.loadAllocationUnallocatedInventories(
                                            config
                                        )
                                    );
                                })
                            );
                        })
                    );
                })
            )
            .subscribe();
    }

    async updateAllocationUnallocatedConfig(
        config: AllocationUnallocateTourSearch
    ) {
        const tours = await this.operatorFiltersState.getTours();
        let currentViewDate =
            this.manageAllocationInventories$.getValue()
                .calendarCurrentViewDate;
        if (
            !currentViewDate ||
            new Date(config.startDate) > currentViewDate ||
            new Date(config.endDate) < currentViewDate
        ) {
            currentViewDate = new Date(config.startDate);
        }
        this.manageAllocationInventories$.next({
            ...this.manageAllocationInventories$.getValue(),
            calendarCurrentViewDate: adjustDate(currentViewDate),
            config: {
                ...config,
                tourId:
                    config.tourId && config.tourId.length > 0
                        ? config.tourId
                        : tours?.map((tour) => tour.tourId.toString()) || [],
            },
            data: [],
        });
    }

    private loadAllocationUnallocatedInventories(
        config: AllocationUnallocateTourSearch
    ): Promise<TourInventoryItem[]> {
        return this.userState.getAspNetUser().then(async (user) => {
            if (!user?.companyUniqueID) {
                return Promise.reject('missing companyUniqueId');
            }
            const tours = await this.operatorFiltersState.getTours();
            return lastValueFrom(
                combineLatest([
                    this.inventoryManagementApiService.getAllocationUnallocatedTourInventoryList(
                        {
                            ...config,
                            tourId:
                                config.tourId !== undefined &&
                                config.tourId.length > 0
                                    ? config.tourId
                                    : tours?.map((tour) =>
                                          tour.tourId.toString()
                                      ) || null,
                            companyId: user.companyUniqueID,
                        }
                    ),
                    this.cruiseCalendarApiService.loadCruiseScheduleCalendar(
                        user.companyUniqueID,
                        config.startDate,
                        config.endDate,
                        config.portId || null,
                        true
                    ),
                ]).pipe(
                    tap(([releaseInventories, ships]) => {
                        this.manageAllocationInventories$.next({
                            config: this.manageAllocationInventories$.getValue()
                                .config,
                            status: 'success',
                            data:
                                releaseInventories.data?.map(
                                    (tourInventory) => {
                                        return {
                                            ...tourInventory,
                                            extras: {
                                                seatsSold:
                                                    tourInventory.seatsSold ||
                                                    0,
                                                seatsAllocated:
                                                    tourInventory.totalUnallocatedSeatTour ||
                                                    0,
                                            },
                                        };
                                    }
                                ) || [],
                            ships: ships?.data || [],
                            calendarCurrentViewDate:
                                this.manageAllocationInventories$.getValue()
                                    .calendarCurrentViewDate,
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
                                    : ErrorDialogMessages.inventoryManagement
                                          .allocationNotFound.description,
                            buttons: [
                                {
                                    text: ErrorDialogMessages
                                        .inventoryManagement.allocationNotFound
                                        .buttons.close,
                                    isPrimary: true,
                                    onClick: () => {
                                        // do nothing
                                    },
                                },
                            ],
                        });
                        this.manageAllocationInventories$.next({
                            ...this.manageAllocationInventories$.getValue(),
                            status: 'error',
                            data: [],
                        });
                        return of(error);
                    })
                )
            );
        });
    }

    getAllocatedDataByFilter(config: AllocationUnallocateTourSearch) {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return Promise.reject('missing companyUniqueId');
            }
            return lastValueFrom(
                combineLatest([
                    this.inventoryManagementApiService.getAllocationUnallocatedTourInventoryList(
                        {
                            ...config,
                            companyId: user.companyUniqueID,
                        }
                    ),
                    this.cruiseCalendarApiService.loadCruiseScheduleCalendar(
                        user.companyUniqueID,
                        config.startDate,
                        config.endDate,
                        config.portId || null,
                        true
                    ),
                ]).pipe(
                    tap(([releaseInventories, ships]) => {
                        this.manageAllocationInventories$.next({
                            config: this.manageAllocationInventories$.getValue()
                                .config,
                            status: 'success',
                            data: releaseInventories?.data || [],
                            ships: ships?.data || [],
                            calendarCurrentViewDate:
                                this.manageAllocationInventories$.getValue()
                                    .calendarCurrentViewDate,
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
                                    : ErrorDialogMessages.inventoryManagement
                                          .allocationNotFound.description,
                            buttons: [
                                {
                                    text: ErrorDialogMessages
                                        .inventoryManagement.allocationNotFound
                                        .buttons.close,
                                    isPrimary: true,
                                    onClick: () => {
                                        // do nothing
                                    },
                                },
                            ],
                        });
                        return of(error);
                    })
                )
            );
        });
    }
}
