import { formatDate } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
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
import {
    AdminTourInventory,
    AllocationUnallocateTourSearch,
    AllocationUnallocatedTourInventoryListItem,
    ApiAdminBookingService,
    CruiseCalendarApiService,
    CruiseEvents,
    CsvService,
    DtdApiService,
    ErrorDialogMessages,
    InventoryManagementApiService,
    OTCBookingItem,
    OperatorFiltersState,
    TourInventoryApiService,
    TourInventoryItem,
    TourInventoryUpdate,
    UIState,
    UIStatus,
    UserState,
    adjustDate,
    getCurrentDateTimeStamp,
} from '@app/core';

export interface ShipInPort {
    shipName: string;
    shipCompanyId: number;
    shipId: number | null;
}

@Injectable()
export class TourInventoryState {
    inventoryManagementApiService = inject(InventoryManagementApiService);
    cruiseCalendarApiService = inject(CruiseCalendarApiService);
    operatorFiltersState = inject(OperatorFiltersState);
    apiTourInventoryService = inject(TourInventoryApiService);
    apiAdminBookingService = inject(ApiAdminBookingService);
    dtdApiService = inject(DtdApiService);
    csvService = inject(CsvService);
    userState = inject(UserState);
    router = inject(Router);
    uiState = inject(UIState);
    manageAllocationInventories$ = new BehaviorSubject<{
        config: AllocationUnallocateTourSearch;
        status: UIStatus;
        data: AdminTourInventory[];
        ships: CruiseEvents[];
        calendarCurrentViewDate: Date | undefined;
    }>({
        config: {
            companyId: '',
            searchType: 'R',
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
                ['/operator/booking-management/tour-inventory'],
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
            let shipcompanyId = config.shipCompanyId;
            if (shipcompanyId === undefined || shipcompanyId === null) {
                shipcompanyId = null;
            } else if (shipcompanyId === 0) {
                shipcompanyId = -1;
            }
            return lastValueFrom(
                combineLatest([
                    this.apiAdminBookingService.getTourInventoryList({
                        companyId: user.companyUniqueID,
                        tourIDs:
                            config.tourId !== undefined &&
                            config.tourId.length > 0
                                ? config.tourId.join(',')
                                : tours
                                      ?.map((tour) => tour.tourId.toString())
                                      .join(',') || '',
                        shipCompanyId: shipcompanyId,
                        shipId: config.shipId || null,
                        startDate: config.startDate,
                        endDate: config.endDate,
                        isActive: true,
                        portId: config.portId || null,
                    }),
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
                                                    tourInventory.totalSeatTour ||
                                                    0,
                                                seatsAllocated:
                                                    tourInventory.tourInventoryAllocatedSeats ||
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

    updateTourInventory(tourInventory: TourInventoryUpdate): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.b2CUserId || !user?.companyUniqueID) {
                return Promise.reject('missing user info');
            }
            return lastValueFrom(
                this.apiTourInventoryService.updateTourInventory({
                    ...tourInventory,
                    companyUniqueID: user.companyUniqueID,
                    createdBy: user.b2CUserId,
                })
            ).then((res) => {
                if (res.success) {
                    this.reload();
                    return Promise.resolve();
                }
                return Promise.reject(res?.error);
            });
        });
    }

    deleteTourInventory(tourInventory: AdminTourInventory): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.b2CUserId) {
                return Promise.reject('missing user info');
            }
            return lastValueFrom(
                this.apiTourInventoryService.deleteTourInventory({
                    id: tourInventory.tourInventoryID,
                    isActive: false,
                })
            ).then((res) => {
                if (res.success) {
                    this.reload();
                    return Promise.resolve();
                }
                return Promise.reject(res?.error);
            });
        });
    }

    loadSingleCruiseSchedule(
        date: Date,
        tourInventoryId: number
    ): Promise<{
        specialNotes?: string;
        ships: ShipInPort[];
    }> {
        const bookDirectOption = {
            shipName: 'Book Direct',
            shipCompanyId: 0,
            shipId: -1,
        };
        return this.userState
            .getAspNetUser()
            .then((user) => {
                const companyId = user?.companyUniqueID;
                if (!companyId) {
                    return Promise.reject('missing companyId');
                }
                return lastValueFrom(
                    this.dtdApiService.getTourInventoryDetails(tourInventoryId)
                ).then((tourInventoryDetails) => {
                    const portId = tourInventoryDetails?.data?.portId;
                    if (!portId) {
                        return Promise.reject('missing portId');
                    }
                    return lastValueFrom(
                        this.cruiseCalendarApiService.loadCruiseScheduleCalendar(
                            companyId,
                            this.formatDateToYYYYMMDD(date),
                            this.formatDateToYYYYMMDD(date),
                            portId,
                            true
                        )
                    ).then((res) => {
                        return {
                            specialNotes:
                                tourInventoryDetails?.data?.specialNotes || '',
                            ships: [
                                bookDirectOption,
                                ...res.data.map((ship) => ({
                                    shipName: ship.title.split('\n')?.[0],
                                    shipCompanyId: ship.shipCompanyId,
                                    shipId: ship.shipId,
                                })),
                            ],
                        };
                    });
                });
            })
            .catch(() => {
                return Promise.resolve({
                    ships: [bookDirectOption],
                });
            });
    }

    loadAssignmentBookingList(
        tourInventoryId: number
    ): Promise<OTCBookingItem[]> {
        const companyUniqueId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyUniqueId) {
            // TODO: throw error
            return Promise.resolve([]);
        }
        return lastValueFrom(
            this.dtdApiService.getDTDAssignmentBookingList(
                companyUniqueId,
                tourInventoryId
            )
        )
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    }

    formatDateToYYYYMMDD(today: Date) {
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // getMonth() returns months from 0-11
        const day = today.getDate();

        // Ensure the month and day are in "MM" and "DD" format (e.g., 05 instead of 5)
        const formattedMonth = month < 10 ? `0${month}` : month;
        const formattedDay = day < 10 ? `0${day}` : day;

        const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;

        return formattedDate;
    }

    exportExcel(): void {
        const manageAllocationInventories =
            this.manageAllocationInventories$.getValue();
        const formattedTourInventories = manageAllocationInventories.data.map(
            (row) => {
                return {
                    'Ship Company': row.cruiseLineName ?? '',
                    Ship: row.cruiseShipName ?? '',
                    Port: row.portName ?? '',
                    Tour: row.tourName ?? '',
                    'Cruise Line Tour Code': row.cruiseLineTourCode ?? '',
                    Date: row.tourInventoryDateString ?? '',
                    Time: row.tourInventoryTimeString ?? '',
                    'Max Capacity': row.capacity ?? '',
                    'Number of Departures at Same Time':
                        row.numberOfDepartureAtSameTime ?? '',
                };
            }
        );
        const advancedSearchParams = manageAllocationInventories.config;
        const filterData = [
            {
                fieldName: 'Tours',
                fieldValue: advancedSearchParams.tourId?.join(', ') ?? '',
            },
            {
                fieldName: 'Cruise Line',
                fieldValue: advancedSearchParams.shipCompanyId ?? '',
            },
            {
                fieldName: 'Cruise Ship',
                fieldValue: advancedSearchParams.shipId ?? '',
            },
            {
                fieldName: 'Ports',
                fieldValue: advancedSearchParams.portId ?? '',
            },
            {
                fieldName: 'Start Date',
                fieldValue: advancedSearchParams.startDate
                    ? formatDate(
                          advancedSearchParams.startDate,
                          'MM/dd/yyyy',
                          'en-US'
                      )
                    : '',
            },
            {
                fieldName: 'End Date',
                fieldValue: advancedSearchParams.endDate
                    ? formatDate(
                          advancedSearchParams.endDate,
                          'MM/dd/yyyy',
                          'en-US'
                      )
                    : '',
            },
        ];
        const timestamp = getCurrentDateTimeStamp();
        this.csvService.exportToCsv({
            filterData,
            mainData: formattedTourInventories,
            spaceBetweenFilterAndDate: 2,
            filename: `tour_inventory_${timestamp}`,
            fileExtension: 'xlsx',
        });
    }
}
