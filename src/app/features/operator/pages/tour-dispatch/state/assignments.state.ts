import { Injectable, inject } from '@angular/core';
import {
    ApiTourInventoryDTDAssignmentModel,
    AppAssignment,
    AppShip,
    DtdApiService,
    NewOTCBookingItem,
    OTCBookingItem,
    UserState,
    OperatorFiltersState,
    AssignmentFilter,
    AssignmentParticipationItem,
    ApiTourInventoryDTDAssignmentPrelimData,
    ApiTourInventoryDTDAssignmentFinalData,
    TourInventoryDTDAssignmentSpecialNotesModel,
    CruiseEvents,
    CruiseCalendarApiService,
    viewportIsUnderMobileWidth,
    PdfService,
    BookingDetails,
    TourInventoryDetails,
    TourInventoryApiService,
    DtdTourTime,
    ApiLinkTourInventory,
    ApiCancelTourInventory,
} from '@app/core';
import { UIState as OperatorUIState } from './ui.state';
import {
    BehaviorSubject,
    catchError,
    combineLatest,
    distinctUntilChanged,
    filter,
    forkJoin,
    from,
    fromEvent,
    lastValueFrom,
    map,
    of,
    switchMap,
    tap,
    timer,
} from 'rxjs';
import { UserActionsState } from './user-actions.state';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';

export type ViewOption = 'table' | 'grid';
export interface ShipInPort {
    shipName: string;
    shipCompanyId: number;
    shipId: number | null;
}

type StatusKeys =
    | 'loadAssignments'
    | 'loadSavedFilterPreference'
    | 'updateAssignment'
    | 'updatePrelim'
    | 'updateDepartureTime'
    | 'updateDockOrDriver'
    | 'updateFinal'
    | 'updateTransportation'
    | 'savingPreferences'
    | 'loadDailyCruiseSchedule'
    | 'updateGuideAndTransportation'
    | 'updateNotes'
    | 'scrolling';
type Status = 'idle' | 'loading' | 'error' | 'success';

@Injectable()
export class AssignmentsState {
    router = inject(Router);
    dtdApiService = inject(DtdApiService);
    tourInventoryApiService = inject(TourInventoryApiService);
    uiState = inject(OperatorUIState);
    userActionsState = inject(UserActionsState);
    userState = inject(UserState);
    operatorFilterState = inject(OperatorFiltersState);
    cruiseCalendarApiService = inject(CruiseCalendarApiService);
    pdfService = inject(PdfService);

    sessionPreferences: {
        driverTransportationMapping: Record<number, number>;
    } = {
        driverTransportationMapping: {},
    };

    refreshTriggered$ = new BehaviorSubject<number>(0);
    configs$ = new BehaviorSubject<{
        assignmentsLastUpdated: Date | undefined;
        dateSelected: Date | undefined;
        filters: AssignmentFilter | undefined;
        autoRefresh: boolean;
        hideConfirmedAndCanceled: boolean;
        viewMode: ViewOption;
        retainExpansion: boolean;
        scrollPosition: number;
    }>({
        assignmentsLastUpdated: undefined,
        dateSelected: new Date(),
        filters: undefined,
        autoRefresh: false,
        hideConfirmedAndCanceled: false,
        viewMode: 'grid',
        retainExpansion: false,
        scrollPosition: 0,
    });
    status$ = new BehaviorSubject<{
        loadAssignments: Status;
        loadSavedFilterPreference: Status;
        updateAssignment: Status;
        updatePrelim: Status;
        updateDepartureTime: Status;
        updateFinal: Status;
        updateDockOrDriver: Status;
        updateTransportation: Status;
        savingPreferences: Status;
        loadDailyCruiseSchedule: Status;
        updateGuideAndTransportation: Status;
        updateNotes: Status;
        scrolling: Status;
    }>({
        loadAssignments: 'idle',
        loadSavedFilterPreference: 'idle',
        updateAssignment: 'idle',
        updatePrelim: 'idle',
        updateDepartureTime: 'idle',
        updateFinal: 'idle',
        updateDockOrDriver: 'idle',
        updateTransportation: 'idle',
        savingPreferences: 'idle',
        loadDailyCruiseSchedule: 'idle',
        updateGuideAndTransportation: 'idle',
        updateNotes: 'idle',
        scrolling: 'idle',
    });
    assignments$ = new BehaviorSubject<
        (AppAssignment & {
            displayBookings: boolean;
            jointDepartureIndicatorColor: string | null;
        })[]
    >([]);
    bookingList$ = new BehaviorSubject<Record<number, OTCBookingItem[]>>({});
    ships$ = new BehaviorSubject<AppShip[]>([]);
    dailyCruiseSchedule$ = new BehaviorSubject<CruiseEvents[]>([]);
    viewportSize$ = new BehaviorSubject<number | undefined>(undefined);

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.loadData();
        this.initAutoRefresh();
        this.initViewportObserver();
        this.operatorFilterState.getEquipmentList();
    }

    private initViewportObserver(): void {
        this.viewportSize$.next(window.innerWidth);
        const resizeObservable$ = fromEvent(window, 'resize');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resizeObservable$.subscribe((event: any) => {
            const viewportWidth = event?.target?.innerWidth;
            this.viewportSize$.next(viewportWidth);
        });
    }

    private initAutoRefresh(): void {
        this.configs$
            .pipe(
                map((config) => config.autoRefresh),
                distinctUntilChanged(),
                switchMap((autoRefresh) => {
                    if (autoRefresh) {
                        const interval = 180000; // 3 minutes
                        return timer(interval, interval);
                    } else {
                        return of(0);
                    }
                })
            )
            .subscribe(() => {
                this.refresh();
            });
    }

    loadSavedFilterPreference(): void {
        this.updateStatus('loadSavedFilterPreference', 'loading');
        this.userState
            .getAspNetUser()
            .then((user) => {
                if (user?.b2CUserId && user.companyUniqueID) {
                    lastValueFrom(
                        this.dtdApiService
                            .getFilterUserPreference(
                                user.companyUniqueID,
                                user.b2CUserId
                            )
                            .pipe(map((res) => res?.data))
                    )
                        .then((res) => {
                            if (res) {
                                this.searchAssignments({
                                    portIds: res.portIds
                                        ?.split(',')
                                        .filter((portId) => !!portId),
                                    tourIds: res.tourIds
                                        ?.split(',')
                                        .filter((tourId) => !!tourId),
                                    // uncomment these when we support saving the following filters
                                    // dockId: res.dockId || 0,
                                    // driverId: res.driverId || 0,
                                    // shipCompanyId: res.shipCompanyId || 0,
                                    // shipId: res.shipId || 0
                                });
                            } else {
                                this.resetAssignmentFilters();
                            }
                            this.updateStatus(
                                'loadSavedFilterPreference',
                                'idle'
                            );
                        })
                        .catch(() => {
                            // do nothing, this isn't harmful, we'll just not set the filters to the saved defaults
                            this.resetAssignmentFilters();
                            this.updateStatus(
                                'loadSavedFilterPreference',
                                'error'
                            );
                        });
                }
            })
            .catch(() => {
                // do nothing, this isn't harmful
                this.updateStatus('loadSavedFilterPreference', 'error');
            });
    }

    saveFilterPreference(filters: AssignmentFilter): void {
        this.updateStatus('savingPreferences', 'loading');
        this.userState.getAspNetUser().then((user) => {
            if (user?.b2CUserId && user.companyUniqueID) {
                lastValueFrom(
                    this.dtdApiService.saveFilterUserPreference({
                        companyId: user.companyUniqueID,
                        createdBy: user.b2CUserId,
                        portIds: filters.portIds?.join(',') || '',
                        tourIds: filters.tourIds?.join(',') || '',
                        // uncomment these when we support saving the following filters
                        // driverId:
                        //     filters && 'driverId' in filters
                        //         ? filters.driverId
                        //         : 0,
                        // dockId:
                        //     filters && 'dockId' in filters ? filters.dockId : 0,
                        // shipCompanyId:
                        //     filters && 'shipCompanyId' in filters
                        //         ? filters.shipCompanyId
                        //         : 0,
                        // shipId:
                        //     filters && 'shipId' in filters ? filters.shipId : 0,
                    })
                )
                    .then(() => {
                        this.updateStatus('savingPreferences', 'success');
                        setTimeout(() => {
                            this.updateStatus('savingPreferences', 'idle');
                        }, 3000);
                    })
                    .catch(() => {
                        // do nothing, this isn't harmful, we'll just not set the filters to the saved defaults
                    });
            }
        });
    }

    loadData(): void {
        // not in use now
        // this.uiState.openNotificationBanner({
        //     text: 'Loading latest data',
        // });
        this.userState.user$
            .pipe(
                filter((user) => !!user),
                distinctUntilChanged(),
                switchMap(() => {
                    return combineLatest([
                        this.operatorFilterState.ports$,
                        this.operatorFilterState.tours$,
                    ]);
                }),
                switchMap(([ports, tours]) => {
                    return this.refreshTriggered$.pipe(
                        switchMap(() => {
                            this.updateStatus('scrolling', 'loading');
                            const dateSelected =
                                this.configs$.getValue().dateSelected;
                            const retainExpansion =
                                this.configs$.getValue().retainExpansion;
                            let expandedAssignments: number[] = [];
                            if (retainExpansion) {
                                expandedAssignments = this.assignments$
                                    .getValue()
                                    .filter(
                                        (assignment) =>
                                            assignment.displayBookings
                                    )
                                    .map(
                                        (assignment) =>
                                            assignment.tourInventoryId
                                    );
                            }
                            const filters = this.configs$.getValue().filters;
                            this.bookingLists = {};
                            return from(
                                this.loadAssignments(
                                    dateSelected || new Date(),
                                    {
                                        ...filters,
                                        portIds:
                                            filters?.portIds &&
                                            filters.portIds.length > 0
                                                ? filters.portIds
                                                : ports?.map((port) =>
                                                      port.portId.toString()
                                                  ),
                                        tourIds:
                                            filters?.tourIds &&
                                            filters.tourIds.length > 0
                                                ? filters.tourIds
                                                : tours?.map((tour) =>
                                                      tour.tourId.toString()
                                                  ),
                                    },
                                    {
                                        expandedAssignments,
                                        skipClearAll: retainExpansion,
                                    }
                                )
                            ).pipe(
                                tap(() => {
                                    if (retainExpansion) {
                                        const scrollPosition =
                                            this.configs$.getValue()
                                                .scrollPosition;
                                        if (scrollPosition) {
                                            setTimeout(() => {
                                                window.scroll({
                                                    top: scrollPosition,
                                                });
                                                this.updateStatus(
                                                    'scrolling',
                                                    'idle'
                                                );
                                            });
                                        }
                                    }
                                    this.configs$.next({
                                        ...this.configs$.getValue(),
                                        scrollPosition: 0,
                                    });
                                }),
                                catchError(() => {
                                    return of([]);
                                })
                            );
                        })
                    );
                })
            )
            .subscribe();
    }

    setAssignmentFilters(filters: AssignmentFilter, date?: Date): void {
        this.configs$.next({
            ...this.configs$.getValue(),
            filters,
            dateSelected: date || this.configs$.getValue().dateSelected,
        });
    }

    resetAssignmentFilters(): void {
        this.configs$.next({
            ...this.configs$.getValue(),
            filters: undefined,
        });
    }

    loadAssignments(
        dateSelected: Date,
        filters?: AssignmentFilter,
        additionalConfig?: {
            expandedAssignments?: number[];
            skipClearAll: boolean;
        }
    ): Promise<AppAssignment[]> {
        if (!additionalConfig?.skipClearAll) {
            this.assignments$.next([]);
        }
        this.updateStatus('loadAssignments', 'loading');
        const companyUniqueId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyUniqueId) {
            // TODO: throw error
            return Promise.resolve([]);
        }
        return lastValueFrom(
            this.dtdApiService.getAssignmentList(
                companyUniqueId,
                dateSelected,
                filters
            )
        )
            .then((assignments) => {
                const jointDepartureMapping: Record<string, string> = {};
                const colorSet = [
                    '#ff9c00',
                    '#1f7ec2',
                    '#0a444d',
                    '#03273d',
                    '#7e4f00',
                    '#217582',
                    '#0f9def',
                    '#011724',
                    '#248439',
                ];

                let formattedAssignments = assignments?.map((assignment) => {
                    const jointDepartureKey = `${assignment.tourId}-${assignment.tourTime}`;
                    let jointDepartureColor = null;
                    if (
                        assignment.tourInventoryFromId ||
                        assignment.tourInventoryToId
                    ) {
                        if (jointDepartureKey in jointDepartureMapping) {
                            jointDepartureColor =
                                jointDepartureMapping[jointDepartureKey];
                        } else {
                            jointDepartureColor =
                                colorSet[
                                    Object.keys(jointDepartureMapping).length %
                                        colorSet.length
                                ];
                            jointDepartureMapping[jointDepartureKey] =
                                jointDepartureColor;
                        }
                    }
                    return {
                        ...assignment,
                        dtdAssignmentGuideId:
                            assignment.dtdAssignmentGuideId || null, // to avoid confusion with the forms thinking that 0 is a valid value,
                        displayBookings:
                            additionalConfig?.expandedAssignments?.indexOf(
                                assignment.tourInventoryId
                            ) !== -1
                                ? true
                                : false,
                        jointDepartureIndicatorColor: jointDepartureColor,
                    };
                });
                if (this.configs$.getValue().hideConfirmedAndCanceled) {
                    formattedAssignments = formattedAssignments.filter(
                        (assignment) => {
                            if (
                                assignment.isClosed ||
                                (assignment.actualTotal !== null &&
                                    !assignment.isOpen) ||
                                (assignment.actualTotal !== null &&
                                    assignment.isClosed)
                            ) {
                                return false;
                            }
                            return true;
                        }
                    );
                }
                this.assignments$.next(formattedAssignments);

                this.updateStatus('loadAssignments', 'idle');
                this.configs$.next({
                    ...this.configs$.getValue(),
                    assignmentsLastUpdated: new Date(),
                });
                return assignments;
            })
            .catch((err) => {
                this.assignments$.next([]);
                this.updateStatus('loadAssignments', 'error');
                return Promise.reject(err);
            });
    }

    loadBookingListStatus$ = new BehaviorSubject<Record<number, boolean>>({});
    private bookingLists: Record<string, OTCBookingItem[]> = {};
    loadAssignmentBookingList(
        tourInventoryId: number,
        skipCache?: boolean,
        returnOnly?: boolean
    ): Promise<OTCBookingItem[]> {
        const companyUniqueId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyUniqueId) {
            // TODO: throw error
            return Promise.resolve([]);
        }
        if (this.bookingLists[tourInventoryId] && !skipCache) {
            return Promise.resolve(this.bookingLists[tourInventoryId]);
        }
        if (!returnOnly) {
            this.loadBookingListStatus$.next({
                ...this.loadBookingListStatus$.getValue(),
                [tourInventoryId]: true,
            });
        }
        return lastValueFrom(
            this.dtdApiService.getDTDAssignmentBookingList(
                companyUniqueId,
                tourInventoryId
            )
        )
            .then((res) => {
                if (!returnOnly) {
                    this.loadBookingListStatus$.next({
                        ...this.loadBookingListStatus$.getValue(),
                        [tourInventoryId]: false,
                    });
                    this.bookingLists[tourInventoryId] = res.data;
                }
                return res.data;
            })
            .catch((err) => {
                if (!returnOnly) {
                    this.loadBookingListStatus$.next({
                        ...this.loadBookingListStatus$.getValue(),
                        [tourInventoryId]: false,
                    });
                }
                // TODO: add error handling
                return Promise.reject(err);
            });
    }

    refresh(retainExpansion?: boolean): void {
        this.configs$.next({
            ...this.configs$.getValue(),
            retainExpansion: retainExpansion || false,
            scrollPosition: retainExpansion ? window.scrollY : 0,
        });
        this.refreshTriggered$.next(new Date().getTime());
    }

    setDateSelected(dateSelected: Date): void {
        this.configs$.next({
            ...this.configs$.getValue(),
            dateSelected: dateSelected,
        });
    }

    setAutoRefresh(autoRefresh: boolean): void {
        this.configs$.next({
            ...this.configs$.getValue(),
            autoRefresh,
        });
    }

    setHideConfirmedAndCanceled(hideConfirmedAndCanceled: boolean): void {
        this.configs$.next({
            ...this.configs$.getValue(),
            hideConfirmedAndCanceled,
        });
    }

    setViewMode(viewMode: string | null): void {
        // default to table on mobile and grid on any bigger viewport
        let view: ViewOption = viewportIsUnderMobileWidth() ? 'table' : 'grid';
        if (viewMode) {
            try {
                if (viewMode.toLowerCase() === 'grid') {
                    view = 'grid';
                } else if (viewMode.toLowerCase() === 'table') {
                    view = 'table';
                }
            } catch (err) {
                // do nothing, prevent throwing error
            }
        }
        this.configs$.next({
            ...this.configs$.getValue(),
            viewMode: view,
        });
    }

    updateDateSelected(
        dateSelected: Date,
        config?: {
            autoRefresh?: boolean;
            viewMode?: ViewOption;
            hideConfirmedAndCanceled?: boolean;
        }
    ): void {
        const viewMode =
            config && 'viewMode' in config
                ? config.viewMode
                : this.configs$.getValue().viewMode;
        const autoRefresh =
            config && 'autoRefresh' in config
                ? config.autoRefresh
                : this.configs$.getValue().autoRefresh;
        const hideConfirmedAndCanceled =
            config && 'hideConfirmedAndCanceled' in config
                ? config.hideConfirmedAndCanceled
                : this.configs$.getValue().hideConfirmedAndCanceled;
        const formattedAssignmentDate = formatDate(
            dateSelected,
            'YYYY-MM-dd',
            'en-US'
        );
        const filters = this.configs$.getValue().filters;
        if (!filters || Object.keys(filters).length === 0) {
            this.router.navigate(
                [`/operator/tour-dispatch/${formattedAssignmentDate}`],
                {
                    queryParams: {
                        ...(autoRefresh ? { autoRefresh: autoRefresh } : []),
                        ...(viewMode ? { view: viewMode } : []),
                        ...(hideConfirmedAndCanceled
                            ? {
                                  hideConfirmedAndCanceled:
                                      hideConfirmedAndCanceled,
                              }
                            : []),
                    },
                }
            );
        } else {
            const base64Filter = btoa(JSON.stringify(filters));
            this.router.navigate(
                [`/operator/tour-dispatch/${formattedAssignmentDate}`],
                {
                    queryParams: {
                        filters: base64Filter,
                        ...(autoRefresh ? { autoRefresh: autoRefresh } : []),
                        ...(viewMode ? { view: viewMode } : []),
                        ...(hideConfirmedAndCanceled
                            ? {
                                  hideConfirmedAndCanceled:
                                      hideConfirmedAndCanceled,
                              }
                            : []),
                    },
                }
            );
        }
    }

    updateGuideAndTransportation(
        assignment: ApiTourInventoryDTDAssignmentModel,
        guideId: number | null,
        transportationId: number | null
    ): Promise<void> {
        this.updateStatus('updateGuideAndTransportation', 'loading');

        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.b2CUserId) {
                    return Promise.reject('missing user information');
                }
                return Promise.resolve(user);
            })
            .then((user) => {
                return lastValueFrom(
                    this.dtdApiService.saveTourInventoryDTDAssignmentDetails({
                        ...assignment,
                        createdBy: user.b2CUserId || '',
                        dtdAssignmentTransportationId: transportationId,
                        dtdAssignmentGuideId: guideId,
                    })
                );
            })
            .then(() => {
                if (assignment.isOpen) {
                    return lastValueFrom(
                        this.dtdApiService.openTourInventoryDTDAssignment(
                            assignment.tourInventoryId
                        )
                    ).then(() => {
                        return Promise.resolve();
                    });
                }
                return Promise.resolve();
            })
            .then(() => {
                this.updateStatus('updateGuideAndTransportation', 'idle');
                if (transportationId && guideId) {
                    this.sessionPreferences = {
                        ...this.sessionPreferences,
                        driverTransportationMapping: {
                            ...this.sessionPreferences
                                .driverTransportationMapping,
                            [guideId]: transportationId,
                        },
                    };
                }
                const assignmentIndex = this.assignments$
                    .getValue()
                    .findIndex(
                        (asgmt) =>
                            asgmt.tourInventoryId === assignment.tourInventoryId
                    );
                if (assignmentIndex >= 0) {
                    const assignments = this.assignments$.getValue();
                    assignments[assignmentIndex].dtdAssignmentGuideId = guideId;
                    assignments[assignmentIndex].dtdAssignmentTransportationId =
                        transportationId;
                    this.assignments$.next(
                        JSON.parse(JSON.stringify(assignments))
                    );
                }
                return Promise.resolve();
            })
            .catch(() => {
                this.updateStatus('updateGuideAndTransportation', 'error');
                return Promise.resolve();
            });
    }

    updateDockOrDriver(
        assignment: ApiTourInventoryDTDAssignmentModel,
        guideId: number
    ): Promise<void> {
        this.updateStatus('updateDockOrDriver', 'loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.b2CUserId) {
                    return Promise.reject('missing user information');
                }
                return Promise.resolve(user);
            })
            .then((user) => {
                return lastValueFrom(
                    this.dtdApiService.saveTourInventoryDTDAssignmentDetails({
                        ...assignment,
                        createdBy: user.b2CUserId || '',
                        dtdAssignmentGuideId: guideId,
                    })
                );
            })
            .then(() => {
                if (assignment.isOpen) {
                    return lastValueFrom(
                        this.dtdApiService.openTourInventoryDTDAssignment(
                            assignment.tourInventoryId
                        )
                    ).then(() => {
                        return Promise.resolve();
                    });
                }
                return Promise.resolve();
            })
            .then(() => {
                this.updateStatus('updateDockOrDriver', 'idle');
                if (assignment.dtdAssignmentTransportationId) {
                    this.sessionPreferences = {
                        ...this.sessionPreferences,
                        driverTransportationMapping: {
                            ...this.sessionPreferences
                                .driverTransportationMapping,
                            [guideId]: assignment.dtdAssignmentTransportationId,
                        },
                    };
                }
                const assignmentIndex = this.assignments$
                    .getValue()
                    .findIndex(
                        (asgmt) =>
                            asgmt.tourInventoryId === assignment.tourInventoryId
                    );
                if (assignmentIndex >= 0) {
                    const assignments = this.assignments$.getValue();
                    assignments[assignmentIndex].dtdAssignmentGuideId = guideId;
                    this.assignments$.next(
                        JSON.parse(JSON.stringify(assignments))
                    );
                }
                return Promise.resolve();
            })
            .catch(() => {
                this.updateStatus('updateDockOrDriver', 'error');
                return Promise.resolve();
            });
    }

    updateTransportation(
        assignment: ApiTourInventoryDTDAssignmentModel,
        dtdAssignmentTransportationId: number
    ): Promise<void> {
        this.updateStatus('updateTransportation', 'loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.b2CUserId) {
                    return Promise.reject('missing user information');
                }
                return Promise.resolve(user);
            })
            .then((user) => {
                return lastValueFrom(
                    this.dtdApiService.saveTourInventoryDTDAssignmentDetails({
                        ...assignment,
                        createdBy: user.b2CUserId || '',
                        dtdAssignmentTransportationId,
                    })
                );
            })
            .then(() => {
                if (assignment.isOpen) {
                    return lastValueFrom(
                        this.dtdApiService.openTourInventoryDTDAssignment(
                            assignment.tourInventoryId
                        )
                    ).then(() => {
                        return Promise.resolve();
                    });
                }
                return Promise.resolve();
            })
            .then(() => {
                if (assignment.dtdAssignmentGuideId) {
                    this.sessionPreferences = {
                        ...this.sessionPreferences,
                        driverTransportationMapping: {
                            ...this.sessionPreferences
                                .driverTransportationMapping,
                            [assignment.dtdAssignmentGuideId]:
                                dtdAssignmentTransportationId,
                        },
                    };
                }
                const assignmentIndex = this.assignments$
                    .getValue()
                    .findIndex(
                        (asgmt) =>
                            asgmt.tourInventoryId === assignment.tourInventoryId
                    );
                if (assignmentIndex >= 0) {
                    const assignments = this.assignments$.getValue();
                    assignments[assignmentIndex].dtdAssignmentTransportationId =
                        dtdAssignmentTransportationId;
                    this.assignments$.next(
                        JSON.parse(JSON.stringify(assignments))
                    );
                }

                this.updateStatus('updateTransportation', 'idle');
                return Promise.resolve();
            })
            .catch(() => {
                this.updateStatus('updateTransportation', 'error');
                return Promise.resolve();
            });
    }

    updatePrelim(
        prelim: ApiTourInventoryDTDAssignmentPrelimData[]
    ): Promise<void> {
        this.updateStatus('updatePrelim', 'loading');
        return this.userState.getAspNetUser().then((user) => {
            if (!user || !user.b2CUserId) {
                return Promise.reject('no user id');
            }
            return lastValueFrom(
                this.dtdApiService.saveTourInventoryDTDAssignmentPrelimDetailsBulk(
                    prelim,
                    user?.b2CUserId
                )
            )
                .then(() => {
                    prelim.forEach((assignment) => {
                        const assignmentIndex = this.assignments$
                            .getValue()
                            .findIndex(
                                (asgmt) =>
                                    asgmt.tourInventoryId ===
                                    assignment.tourInventoryId
                            );
                        if (assignmentIndex >= 0) {
                            const assignments = this.assignments$.getValue();
                            assignments[assignmentIndex].preLim =
                                assignment.prelim;
                            this.assignments$.next(
                                JSON.parse(JSON.stringify(assignments))
                            );
                        }
                    });
                    this.updateStatus('updatePrelim', 'idle');
                    return Promise.resolve();
                })
                .catch((err) => {
                    this.updateStatus('updatePrelim', 'error');
                    return Promise.reject(err);
                });
        });
    }

    updateFinal(
        final: ApiTourInventoryDTDAssignmentFinalData[]
    ): Promise<void> {
        this.updateStatus('updateFinal', 'loading');
        return this.userState.getAspNetUser().then((user) => {
            if (!user || !user.b2CUserId) {
                return Promise.reject('no user id');
            }
            return lastValueFrom(
                this.dtdApiService.saveTourInventoryDTDAssignmentFinalDetailsBulk(
                    final,
                    user?.b2CUserId
                )
            )
                .then(() => {
                    final.forEach((f) => {
                        const assignmentIndex = this.assignments$
                            .getValue()
                            .findIndex(
                                (asgmt) =>
                                    asgmt.tourInventoryId === f.tourInventoryId
                            );
                        if (assignmentIndex >= 0) {
                            const assignments = this.assignments$.getValue();
                            assignments[assignmentIndex].final = f.final;
                            this.assignments$.next(
                                JSON.parse(JSON.stringify(assignments))
                            );
                        }
                    });
                    this.updateStatus('updateFinal', 'idle');
                    return Promise.resolve();
                })
                .catch((err) => {
                    this.updateStatus('updateFinal', 'error');
                    return Promise.reject(err);
                });
        });
    }

    updateActualDepartureTime(
        tourInventoryId: number,
        actualDepartureTime: string
    ): Promise<void> {
        this.updateStatus('updateDepartureTime', 'loading');
        return this.userState.getAspNetUser().then((user) => {
            if (!user || !user.b2CUserId) {
                return Promise.reject('no user id');
            }
            return lastValueFrom(
                this.dtdApiService.updateActualDepartureTime(
                    tourInventoryId,
                    actualDepartureTime
                )
            )
                .then(() => {
                    this.refresh(true);
                    this.updateStatus('updateDepartureTime', 'idle');
                    return Promise.resolve();
                })
                .catch((err) => {
                    this.updateStatus('updateDepartureTime', 'error');
                    return Promise.reject(err);
                });
        });
    }

    updateAssignment(
        assignment: ApiTourInventoryDTDAssignmentModel
    ): Promise<void> {
        this.updateStatus('updateAssignment', 'loading');
        return lastValueFrom(
            this.dtdApiService.saveTourInventoryDTDAssignmentDetails(assignment)
        )
            .then(() => {
                this.updateStatus('updateAssignment', 'idle');
                return Promise.resolve();
            })
            .catch((err) => {
                this.updateStatus('updateAssignment', 'error');
                return Promise.reject(err);
            });
    }

    openDeparture(assignment: AppAssignment): Promise<void> {
        const userId = this.userState.aspNetUser$.getValue()?.b2CUserId;
        if (!userId) {
            return Promise.reject('no userId');
        }
        // this first step is a workaround as the isClosed flag doesn't get reset
        // when just calling the openTourInventoryDTDAssignment API,
        // with the assignment ending up with both isClosed and isOpen flags set to true
        return lastValueFrom(
            this.dtdApiService.saveTourInventoryDTDAssignmentDetails({
                tourInventoryId: assignment.tourInventoryId,
                dtdAssignmentGuideId: assignment.dtdAssignmentGuideId || 0,
                actualAdults:
                    assignment.actualAdults === 0
                        ? null
                        : assignment.actualAdults,
                actualChildren:
                    assignment.actualAdults === 0
                        ? null
                        : assignment.actualAdults,
                cruiseLineEscorts: assignment.cruiseLineEscorts,
                createdBy: userId, // TODO: what should this field be
                specialNotes: assignment.specialNotes || '',
                payingAdditionalGuests: assignment.payingAdditionalGuests,
                isClosed: false,
                final: assignment.final,
                isFinalOnlyUpdate: false,
                equipmentNumber: 0,
                dtdAssignmentTransportationId:
                    assignment.dtdAssignmentTransportationId || null,
            })
        )
            .then(() => {
                return lastValueFrom(
                    this.dtdApiService.openTourInventoryDTDAssignment(
                        assignment.tourInventoryId
                    )
                );
            })
            .then(() => {
                return Promise.resolve();
            });
    }

    closeDeparture(assignment: AppAssignment): Promise<void> {
        const userId = this.userState.aspNetUser$.getValue()?.b2CUserId;
        if (!userId) {
            return Promise.reject('no userId');
        }
        return lastValueFrom(
            this.dtdApiService.saveTourInventoryDTDAssignmentDetails({
                tourInventoryId: assignment.tourInventoryId,
                dtdAssignmentGuideId: assignment.dtdAssignmentGuideId || 0,
                actualAdults:
                    assignment.actualAdults === 0
                        ? null
                        : assignment.actualAdults,
                actualChildren:
                    assignment.actualChildren === 0
                        ? null
                        : assignment.actualChildren,
                cruiseLineEscorts: assignment.cruiseLineEscorts,
                createdBy: userId, // TODO: what should this field be
                specialNotes: assignment.specialNotes || '',
                payingAdditionalGuests: assignment.payingAdditionalGuests,
                isClosed: true,
                final: assignment.final,
                isFinalOnlyUpdate: false, // TODO: need to verify what is needed here
                equipmentNumber: 0,
                dtdAssignmentTransportationId:
                    assignment.dtdAssignmentTransportationId || null,
            })
        ).then(() => {
            return Promise.resolve();
        });
    }

    unopenDeparture(assignment: AppAssignment): Promise<void> {
        const userId = this.userState.aspNetUser$.getValue()?.b2CUserId;
        if (!userId) {
            return Promise.reject('no userId');
        }
        return lastValueFrom(
            this.dtdApiService.openTourInventoryDTDAssignment(
                assignment.tourInventoryId
            )
        )
            .then(() => {
                return lastValueFrom(
                    this.dtdApiService.saveTourInventoryDTDAssignmentDetails({
                        tourInventoryId: assignment.tourInventoryId,
                        dtdAssignmentGuideId:
                            assignment.dtdAssignmentGuideId || 0,
                        actualAdults:
                            assignment.actualAdults === 0
                                ? null
                                : assignment.actualAdults,
                        actualChildren:
                            assignment.actualChildren === 0
                                ? null
                                : assignment.actualChildren,
                        cruiseLineEscorts: assignment.cruiseLineEscorts,
                        createdBy: userId, // TODO: what should this field be
                        specialNotes: assignment.specialNotes || '',
                        payingAdditionalGuests:
                            assignment.payingAdditionalGuests,
                        isClosed: false,
                        final: assignment.final,
                        isFinalOnlyUpdate: false, // TODO: need to verify what is needed here
                        equipmentNumber: 0,
                        dtdAssignmentTransportationId:
                            assignment.dtdAssignmentTransportationId || null,
                    })
                );
            })
            .then(() => {
                return Promise.resolve();
            });
    }

    private updateStatus(statusKey: StatusKeys, status: Status): void {
        this.status$.next({
            ...this.status$.getValue(),
            [statusKey]: status,
        });
    }

    searchAssignments(
        filters: AssignmentFilter | null,
        config?: {
            autoRefresh?: boolean;
            viewMode?: ViewOption;
            hideConfirmedAndCanceled?: boolean;
        }
    ): void {
        const viewMode =
            config && 'viewMode' in config
                ? config.viewMode
                : this.configs$.getValue().viewMode;
        const autoRefresh =
            config && 'autoRefresh' in config
                ? config.autoRefresh
                : this.configs$.getValue().autoRefresh;
        const hideConfirmedAndCanceled =
            config && 'hideConfirmedAndCanceled' in config
                ? config.hideConfirmedAndCanceled
                : this.configs$.getValue().hideConfirmedAndCanceled;
        const selectedDate = formatDate(
            this.configs$.getValue().dateSelected || new Date(),
            'YYYY-MM-dd',
            'en-US'
        );
        if (!filters || Object.keys(filters).length === 0) {
            if (autoRefresh || viewMode) {
                this.router.navigate(
                    [`/operator/tour-dispatch/${selectedDate}`],
                    {
                        queryParams: {
                            ...(autoRefresh
                                ? { autoRefresh: autoRefresh }
                                : []),
                            ...(viewMode ? { view: viewMode } : []),
                            ...(hideConfirmedAndCanceled
                                ? {
                                      hideConfirmedAndCanceled:
                                          hideConfirmedAndCanceled,
                                  }
                                : []),
                        },
                    }
                );
            } else {
                this.router.navigate([
                    `/operator/tour-dispatch/${selectedDate}`,
                ]);
            }
        } else {
            const base64Filter = btoa(JSON.stringify(filters));
            const currentFilters = btoa(
                JSON.stringify(this.configs$.getValue()?.filters)
            );
            if (
                base64Filter === currentFilters &&
                config?.autoRefresh === this.configs$.getValue()?.autoRefresh &&
                config?.viewMode === this.configs$.getValue()?.viewMode &&
                config?.hideConfirmedAndCanceled ===
                    this.configs$.getValue()?.hideConfirmedAndCanceled
            ) {
                this.refresh();
            } else {
                let queryParams: { filters: string; autoRefresh?: boolean } = {
                    filters: base64Filter,
                };
                if (autoRefresh || viewMode || hideConfirmedAndCanceled) {
                    queryParams = {
                        ...queryParams,
                        ...(autoRefresh ? { autoRefresh: autoRefresh } : []),
                        ...(viewMode ? { view: viewMode } : []),
                        ...(hideConfirmedAndCanceled
                            ? {
                                  hideConfirmedAndCanceled:
                                      hideConfirmedAndCanceled,
                              }
                            : []),
                    };
                }
                this.router.navigate(
                    [`/operator/tour-dispatch/${selectedDate}`],
                    {
                        queryParams,
                    }
                );
            }
        }
    }

    clearFilters(): void {
        const selectedDate = formatDate(
            this.configs$.getValue().dateSelected || new Date(),
            'YYYY-MM-dd',
            'en-US'
        );
        this.router.navigate([`/operator/tour-dispatch/${selectedDate}`]);
    }

    shareAssignmentPdf(email: string, filter: AssignmentFilter): Promise<void> {
        const formattedAssignmentDate = formatDate(
            this.configs$.getValue().dateSelected || new Date(), // default to today if no date is selected
            'YYYY-MM-dd',
            'en-US'
        );
        const timeStamp = this.formatTimeStamp(new Date().toISOString());
        return lastValueFrom(
            this.dtdApiService.sharePDFDTDAssignmentList({
                companyId:
                    this.userState.aspNetUser$.getValue()?.companyUniqueID ||
                    '',
                assignmentDate: formattedAssignmentDate || '',
                portIds: filter.portIds || undefined,
                tourIds: filter.tourIds || undefined,
                driverId: filter.driverId || undefined,
                dockId: filter.dockId || undefined,
                sortColumn: filter.sortDirection || undefined,
                shipCompanyId: filter.shipCompanyId || undefined,
                shipId: filter.shipId || undefined,
                email: email,
                currentDateTime: timeStamp,
            })
        ).then(() => {
            return Promise.resolve();
        });
    }

    addOtcBooking(booking: NewOTCBookingItem, refresh = true): Promise<void> {
        return lastValueFrom(
            this.dtdApiService.insertUpdateOTCBooking(booking)
        ).then((res) => {
            if (res.success === true) {
                if (refresh) {
                    this.refresh(true);
                }
                return Promise.resolve();
            }
            return Promise.reject(res.error);
        });
    }

    deleteOTCBooking(bookingId: number): Promise<void> {
        const userId = this.userState.aspNetUser$.getValue()?.b2CUserId;
        if (!userId) {
            return Promise.reject('Missing userId');
        }
        return lastValueFrom(
            this.dtdApiService.deleteOTCBooking(bookingId, userId)
        ).then((res) => {
            if (res.success === true) {
                return Promise.resolve();
            }
            return Promise.reject(res.error);
        });
    }

    updateSpecialNotes(
        config: TourInventoryDTDAssignmentSpecialNotesModel
    ): Promise<void> {
        const userId = this.userState.aspNetUser$.getValue()?.b2CUserId;
        if (!userId) {
            return Promise.reject('Missing userId');
        }
        this.updateStatus('updateNotes', 'loading');
        return lastValueFrom(
            this.dtdApiService.updateSpecialNotes({
                ...config,
                createdBy: userId,
            })
        )
            .then((res) => {
                if (res.success) {
                    this.updateStatus('updateNotes', 'success');
                    return Promise.resolve();
                }
                return Promise.reject(res.error);
            })
            .catch((err) => {
                this.updateStatus('updateNotes', 'error');
                return Promise.reject(err);
            });
    }

    updateAssignmentParticipation(
        item: AssignmentParticipationItem[]
    ): Promise<void> {
        return lastValueFrom(
            this.dtdApiService.saveAssignmentParticipation(item)
        ).then((res) => {
            if (res.success) {
                return Promise.resolve();
            }
            return Promise.reject(res.error);
        });
    }

    checkinBooking(bookingId: number): Promise<void> {
        return lastValueFrom(this.dtdApiService.checkinBooking(bookingId)).then(
            (res) => {
                if (res.success) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(res.errors);
                }
            }
        );
    }

    loadSingleCruiseSchedule(
        date: Date,
        tourInventoryId: number,
        includeBookDirect?: boolean
    ): Promise<ShipInPort[]> {
        const bookDirectOption = {
            shipName: 'Book Direct',
            shipCompanyId: 0,
            shipId: null,
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
                        const formattedData = res.data.map((ship) => ({
                            shipName: ship.title.split('\n')?.[0],
                            shipCompanyId: ship.shipCompanyId,
                            shipId: ship.shipId,
                        }));
                        if (includeBookDirect) {
                            return [bookDirectOption, ...formattedData];
                        }

                        return formattedData;
                    });
                });
            })
            .catch(() => {
                if (includeBookDirect) {
                    return Promise.resolve([bookDirectOption]);
                }
                return Promise.resolve([]);
            });
    }

    private lastCruiseScheduleConfig:
        | { date: number; portIds: number[] }
        | undefined = undefined;
    loadDailyCruiseSchedule(date: Date, portIds: number[]): void {
        // simple cache mechanism to prevent calling the cruise schedule multiple times unnecessarily
        if (
            this.lastCruiseScheduleConfig &&
            this.lastCruiseScheduleConfig.date === date.getTime() &&
            this.lastCruiseScheduleConfig.portIds.toString() ===
                portIds.sort((a, b) => a - b).toString()
        ) {
            return;
        }
        this.dailyCruiseSchedule$.next([]);
        const companyId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyId) {
            return;
        }

        Promise.all(
            portIds.map((portId) =>
                lastValueFrom(
                    this.cruiseCalendarApiService.loadCruiseScheduleCalendar(
                        companyId,
                        this.formatDateToYYYYMMDD(date),
                        this.formatDateToYYYYMMDD(date),
                        portId,
                        true
                    )
                )
                    .then((res) => {
                        if (res.success === true) {
                            this.dailyCruiseSchedule$.next(res.data);
                            return res.data;
                        } else {
                            return Promise.reject('Unsuccessful response');
                        }
                    })
                    .catch(() => {
                        // prevent one failed API call from blocking the entire call
                        return Promise.resolve([]);
                    })
            )
        ).then((res) => {
            const dailyCruiseEventsResponse = res.flat();
            const updatedDailyCruiseEventsResponse =
                dailyCruiseEventsResponse.map((item) => {
                    const match = item.title.match(/^(.*?) - (.*?)\n(.*?)$/);

                    if (item.title.includes('-') && match) {
                        const cruiseTitle = match[1].trim();
                        const dockAssignment = match[2].trim();
                        const cruiseTime = match[3].trim();
                        const newItem = {
                            ...item,
                            meta: {
                                cruiseLine: cruiseTitle,
                                cruiseTime: cruiseTime,
                                dockAssignment: dockAssignment,
                            },
                        };
                        return newItem;
                    } else {
                        return {
                            ...item,
                            meta: {
                                cruiseLine: item.title.split('\n')[0],
                                cruiseTime: item.title.split('\n')[1],
                                dockAssignment: '',
                            },
                        };
                    }
                });
            this.dailyCruiseSchedule$.next(updatedDailyCruiseEventsResponse);
            this.lastCruiseScheduleConfig = {
                date: date.getTime(),
                portIds: portIds ? portIds.sort((a, b) => a - b) : [],
            };
        });
    }

    downloadPdf(): Promise<void> {
        const assignments = this.assignments$.getValue();
        const config = this.configs$.getValue();
        const dateSelected = config.dateSelected;
        if (!assignments || assignments.length === 0 || !dateSelected) {
            return Promise.reject('Incomplete Information');
        }
        Promise.all([
            this.operatorFilterState.getGuides(),
            this.operatorFilterState.getEquipmentList(),
        ]).then(([guides, equipments]) => {
            const formattedAssignments = assignments.map((assignment) => {
                let total: number | null = null;
                if (assignment.final !== null && assignment.final >= 0) {
                    total = (assignment.totalBooked || 0) + assignment.final;
                } else {
                    total =
                        (assignment.totalBooked || 0) +
                        (assignment.preLim || 0);
                }

                let actual: number | null = null;
                if (
                    !assignment.isOpen &&
                    !assignment.isClosed &&
                    assignment.actualTotal !== null &&
                    assignment.actualTotal >= 0
                ) {
                    actual = assignment.actualTotal;
                }

                let status = '';
                if (
                    assignment.isOpen ||
                    assignment.isClosed ||
                    (assignment.actualTotal !== null && !assignment.isOpen) ||
                    (assignment.actualTotal !== null && assignment.isClosed)
                ) {
                    if (assignment.isOpen) {
                        status = 'Open';
                    } else if (assignment.isClosed) {
                        status = 'Closed';
                    } else if (
                        (assignment.actualTotal !== null &&
                            !assignment.isOpen) ||
                        (assignment.actualTotal !== null && assignment.isClosed)
                    ) {
                        status = 'Confirmed';
                    }
                }

                const equipment =
                    equipments && assignment.dtdAssignmentTransportationId
                        ? equipments.find(
                              (equipment) =>
                                  equipment.equipmentID ===
                                  assignment.dtdAssignmentTransportationId
                          )
                        : '';
                return {
                    time: assignment.tourTime || '',
                    tourName: assignment.tourName || '',
                    allocation: assignment.shipName || '',
                    total: total || '',
                    actual: actual || '',
                    guideName:
                        guides && assignment.dtdAssignmentGuideId
                            ? guides.find(
                                  (guide) =>
                                      guide.guideId ===
                                      assignment.dtdAssignmentGuideId
                              )?.guideFirstNameNickname
                            : '',
                    transportationName: equipment
                        ? `${equipment.equipmentNumber} - ${equipment.equipmentType}`
                        : '',
                    maxCapacity: assignment.tourInventoryAllocatedSeats || '',
                    dockName: assignment.dockName || '',
                    status: status,
                };
            });

            this.pdfService.generateAssignmentsPdf(formattedAssignments, {
                lastUpdated: config.assignmentsLastUpdated,
                dateSelected: dateSelected,
            });
        });
        return Promise.resolve();
    }

    updateAssignmentState(
        assignment: AppAssignment & {
            displayBookings: boolean;
            jointDepartureIndicatorColor: string | null;
        }
    ): void {
        const assignmentIndex = this.assignments$
            .getValue()
            .findIndex(
                (asgmt) => asgmt.tourInventoryId === assignment.tourInventoryId
            );
        if (assignmentIndex >= 0) {
            const assignments = this.assignments$.getValue();
            assignments[assignmentIndex] = assignment;
            this.assignments$.next(JSON.parse(JSON.stringify(assignments)));
        }
    }

    resetStatus(): void {
        this.status$.next({
            loadAssignments: 'idle',
            loadSavedFilterPreference: 'idle',
            updateAssignment: 'idle',
            updateDockOrDriver: 'idle',
            updatePrelim: 'idle',
            updateDepartureTime: 'idle',
            updateFinal: 'idle',
            updateTransportation: 'idle',
            savingPreferences: 'idle',
            loadDailyCruiseSchedule: 'idle',
            updateGuideAndTransportation: 'idle',
            updateNotes: 'idle',
            scrolling: 'idle',
        });
    }

    resetIndividualStatus(statusKey: StatusKeys): void {
        this.status$.next({
            ...this.status$.getValue(),
            [statusKey]: 'idle',
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

    formatTimeStamp(dateTime: string): string {
        const date = new Date(dateTime);

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

        return `${month}/${day}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
    }

    getBookingAndTourDetails(
        bookingId: number
    ): Promise<{ booking: BookingDetails; tour: TourInventoryDetails }[]> {
        return lastValueFrom(
            this.dtdApiService.getBooking(bookingId).pipe(
                map((res) => res.data),
                switchMap((bookings) => {
                    return forkJoin(
                        bookings.map((booking) =>
                            this.dtdApiService
                                .getTourInventoryDetails(
                                    booking.tourInventoryID
                                )
                                .pipe(
                                    map((tour) => {
                                        return { booking, tour: tour.data };
                                    })
                                )
                        )
                    );
                })
            )
        );
    }

    getAlternateTourTimes(
        tourId: number,
        bookingDate: Date
    ): Promise<DtdTourTime[]> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return Promise.resolve([]);
            }
            return lastValueFrom(
                this.dtdApiService.getDtdTourTimes(
                    user.companyUniqueID,
                    tourId,
                    null,
                    0,
                    this.formatDateToYYYYMMDD(bookingDate)
                )
            )
                .then((res) => {
                    return Promise.resolve(res.data);
                })
                .catch(() => {
                    return Promise.resolve([]);
                });
        });
    }

    joinDepartures(config: ApiLinkTourInventory): Promise<void> {
        return lastValueFrom(this.dtdApiService.linkTourInventory(config)).then(
            (res) => {
                if (res.success) {
                    return Promise.resolve();
                }
                return Promise.reject(res.error);
            }
        );
    }

    cancelTourInventory(config: ApiCancelTourInventory): Promise<void> {
        return lastValueFrom(
            this.dtdApiService.cancelTourInventory(config)
        ).then((res) => {
            if (res.success) {
                return Promise.resolve();
            }
            return Promise.reject(res.error);
        });
    }

    revertCancelTourInventory(tourInventoryId: number): Promise<void> {
        return lastValueFrom(
            this.dtdApiService.revertCancelTourInventory(tourInventoryId)
        ).then((res) => {
            if (res.success) {
                return Promise.resolve();
            }
            return Promise.reject(res.error);
        });
    }
}
