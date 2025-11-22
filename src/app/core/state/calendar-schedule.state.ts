import { Injectable, inject } from '@angular/core';
import {
    BehaviorSubject,
    Subscription,
    filter,
    lastValueFrom,
    map,
    switchMap,
    tap,
} from 'rxjs';
import { CruiseEvents, Docks, DTDdockDetails, Port } from '../models';
import { CruiseCalendarApiService } from '../services';
import { UserState } from './user.state';
import { OperatorFiltersState } from './operator-filters.state';

@Injectable({
    providedIn: 'root',
})
export class CalendarScheduleState {
    private calendarSubscription: Subscription | undefined;
    private today = new Date();
    cruiseCalendarApiService = inject(CruiseCalendarApiService);
    initialPort: number | undefined;

    userState = inject(UserState);
    operatorFiltersState = inject(OperatorFiltersState);

    calendarConfig$ = new BehaviorSubject<{
        startDate: Date;
        endDate: Date;
        portId: number | null;
        excludeCanceled: boolean;
    }>({
        startDate: new Date(
            this.today.getFullYear() - 2,
            this.today.getMonth(),
            1
        ),
        endDate: new Date(
            this.today.getFullYear() + 2,
            this.today.getMonth(),
            this.today.getDate()
        ),
        portId: null,
        excludeCanceled: true,
    });

    calendarEvents$ = new BehaviorSubject<CruiseEvents[]>([]);
    docks$ = new BehaviorSubject<Docks[]>([]);
    ports$ = new BehaviorSubject<Port[]>([]);
    isLoading$ = new BehaviorSubject<boolean>(false);
    private refreshTriggered$ = new BehaviorSubject<number>(0);

    init(): void {
        this.initCalendarEvents();
        this.initDocks();
        this.initPorts();
    }

    initCalendarEvents(): void {
        if (this.calendarSubscription) {
            return;
        }

        this.calendarSubscription = this.userState.aspNetUser$
            .pipe(
                map((res) => {
                    return res?.companyUniqueID;
                }),
                filter(
                    (res) =>
                        !!res &&
                        typeof res === 'string' &&
                        res.length !== undefined
                ),
                switchMap((companyUniqueId) => {
                    return this.calendarConfig$.pipe(
                        filter(
                            (calendarConfig) =>
                                calendarConfig.portId !== null &&
                                calendarConfig.portId >= 0
                        ),
                        switchMap((calendarConfig) => {
                            return this.refreshTriggered$.pipe(
                                switchMap(() => {
                                    this.isLoading$.next(true);
                                    this.calendarEvents$.next([]);
                                    return this.cruiseCalendarApiService
                                        .loadCruiseScheduleCalendar(
                                            companyUniqueId?.toString() || '', // Provide a default value if companyUniqueId is undefined
                                            this.formatDateToYYYYMMDD(
                                                calendarConfig.startDate.toLocaleDateString()
                                            ),
                                            this.formatDateToYYYYMMDD(
                                                calendarConfig.endDate.toLocaleDateString()
                                            ),
                                            calendarConfig.portId,
                                            calendarConfig.excludeCanceled
                                        )
                                        .pipe(
                                            map((res) => {
                                                if (res && res.data) {
                                                    return res.data;
                                                }
                                                return [];
                                            }),
                                            tap(() => {
                                                this.isLoading$.next(false);
                                            })
                                        );
                                })
                            );
                        })
                    );
                })
            )
            .subscribe((calendarEvents) => {
                this.calendarEvents$.next(calendarEvents);
            });
    }

    initDocks(): void {
        this.docks$.next([]);
        this.operatorFiltersState
            .getDocks()
            .then((docks) => {
                this.docks$.next(
                    docks.map((dock) => {
                        return {
                            ...dock,
                            label: `${dock.dockName} - ${dock.portName}`,
                        };
                    })
                );
            })
            .catch(() => {
                // we'll need to add some error handling here
            });
    }

    initPorts(): void {
        this.operatorFiltersState.getPorts().then((ports) => {
            this.calendarConfig$.next({
                ...this.calendarConfig$.value,
                portId:
                    ports?.length > 0 ? ports[ports.length - 1].portId : null,
            });
            this.ports$.next(ports);
        });
    }

    refreshCalendarData(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    updateDtdAssignment(dockAssignmemtDetails: DTDdockDetails): Promise<void> {
        return lastValueFrom(
            this.cruiseCalendarApiService
                .saveDockAssignmentDetail(
                    dockAssignmemtDetails.companyUniqueID,
                    dockAssignmemtDetails.portId,
                    dockAssignmemtDetails.assignmentDate,
                    dockAssignmemtDetails.shipId,
                    dockAssignmemtDetails.dockId
                )
                .pipe(
                    map((res) => {
                        if (!res.success) {
                            throw res.error;
                        }
                        return res.data;
                    })
                )
        ).then(() => {
            this.refreshCalendarData();
            return Promise.resolve();
        });
    }

    updatePortId(portId: number | null) {
        const calendarConfig = this.calendarConfig$.getValue();
        this.calendarConfig$.next({
            ...calendarConfig,
            portId: portId,
        });
    }

    updateExcludeCanceled(value: boolean) {
        const calendarConfig = this.calendarConfig$.getValue();
        this.calendarConfig$.next({
            ...calendarConfig,
            excludeCanceled: value,
        });
    }

    updateStartDate(startDate: Date) {
        const calendarConfig = this.calendarConfig$.getValue();
        this.calendarConfig$.next({
            ...calendarConfig,
            startDate: startDate,
        });
    }

    updateEndDate(endDate: Date) {
        const calendarConfig = this.calendarConfig$.getValue();
        this.calendarConfig$.next({
            ...calendarConfig,
            endDate: endDate,
        });
    }

    formatDateToYYYYMMDD(inputDate: string) {
        // Split the input date into month, day, and year components
        const [month, day, year] = inputDate.split('/');

        // Create a new date string in "YYYY-MM-DD" format
        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate;
    }
}
