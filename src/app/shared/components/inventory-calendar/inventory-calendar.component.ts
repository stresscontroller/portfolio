import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule, CalendarView } from 'angular-calendar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import {
    BehaviorSubject,
    Observable,
    Subject,
    combineLatest,
    distinctUntilChanged,
    map,
    takeUntil,
} from 'rxjs';
import { ShipHeightPipe, ShipPositionPipe, TourCountPipe } from './pipes';
import {
    CruiseEvents,
    OperatorFiltersState,
    Port,
    ShipCompany,
    Tour,
    TourInventoryItemExtended,
} from '@app/core';
import {
    DayViewComponent,
    MonthHeaderComponent,
    MonthViewComponent,
    WeekHeaderComponent,
    WeekViewComponent,
} from './components';
import {
    CalendarData,
    CalendarMonthDay,
    CalendarShip,
    CalendarTour,
} from './models';
import { PermissionConfig } from '../../directives';

interface EmptyCell {
    id: string;
    title: string;
    start: Date;
    end: Date;
}
@Component({
    standalone: true,
    selector: 'app-inventory-calendar',
    templateUrl: './inventory-calendar.component.html',
    styleUrls: ['./inventory-calendar.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        CalendarModule,
        ButtonModule,
        TooltipModule,
        OverlayPanelModule,

        // pipes
        ShipPositionPipe,
        ShipHeightPipe,
        TourCountPipe,

        // components
        DayViewComponent,
        WeekViewComponent,
        MonthViewComponent,
        MonthHeaderComponent,
        WeekHeaderComponent,
    ],
})
export class InventoryCalendarComponent {
    @Input() displayControls = true;
    @Input() displayQuickActions = true;
    @Input() allowModifyReleaseInv = false;
    @Input() allowDrag = false;
    @Input() displayAddUnallocatedButton = false;
    @Input() set defaultView(value: 'day' | 'week' | 'month') {
        if (value === 'day') {
            this.view = CalendarView.Day;
        } else if (value === 'week') {
            this.view = CalendarView.Week;
        } else {
            this.view = CalendarView.Month;
        }
    }

    @Input() set config(value: {
        config: { tourId: string[]; startDate: Date };
        tourInventories: TourInventoryItemExtended[];
        ships: CruiseEvents[];
        calendarCurrentViewDate?: Date | undefined;
    }) {
        this.manageAllocationInventories$.next(value);
    }
    @Input() addUnallocatedPermission: PermissionConfig | undefined = undefined;
    @Input() allocatePermission: PermissionConfig | undefined = undefined;
    @Input() releasePermission: PermissionConfig | undefined = undefined;
    @Input() deletePermission: PermissionConfig | undefined = undefined;
    @Input() editPermission: PermissionConfig | undefined = undefined;

    @Output() addClicked = new EventEmitter<void>();
    @Output() allocateInventory = new EventEmitter<{
        tour: CalendarTour;
        ships: CalendarShip[];
    }>();
    @Output() releaseInventory = new EventEmitter<CalendarTour>();
    @Output() deleteInventory = new EventEmitter<CalendarTour>();
    @Output() editInventory = new EventEmitter<{
        tour: CalendarTour;
        ships: CalendarShip[];
    }>();
    @Output() moveInventory = new EventEmitter<{
        tour: CalendarTour;
        proposedDateTime: Date;
    }>();
    @Output() viewDateChange = new EventEmitter<Date>();
    @Output() viewChange = new EventEmitter<CalendarView>();

    operatorFiltersState = inject(OperatorFiltersState);
    manageAllocationInventories$ = new BehaviorSubject<{
        config: { tourId: string[]; startDate: Date };
        tourInventories: TourInventoryItemExtended[];
        ships: CruiseEvents[];
        calendarCurrentViewDate?: Date;
    }>({
        config: {
            tourId: [],
            startDate: new Date(),
        },
        tourInventories: [],
        ships: [],
        calendarCurrentViewDate: new Date(),
    });

    CalendarView = CalendarView;
    view: CalendarView = CalendarView.Month;
    viewDate: Date = this.setToSunday(new Date());
    daysInWeek = 7;

    // to generate custom cells
    emptyCells$ = new BehaviorSubject<EmptyCell[]>([]);
    startDate$ = this.manageAllocationInventories$.pipe(
        map((data) => data.config.startDate)
    );
    private cruiseLinesObj$ = this.operatorFiltersState.cruiseLines$.pipe(
        map((cruiseLines) => {
            return cruiseLines.reduce<Record<number, ShipCompany>>(
                (acc, curr) => {
                    acc[curr.shipCompanyId] = curr;
                    return acc;
                },
                {}
            );
        })
    );

    private portsObj$ = this.operatorFiltersState.ports$.pipe(
        map((ports) => {
            return ports.reduce<Record<number, Port>>((acc, curr) => {
                acc[curr.portId] = curr;
                return acc;
            }, {});
        })
    );

    private toursObj$ = this.operatorFiltersState.tours$.pipe(
        map((tours) => {
            return tours.reduce<Record<number, Tour>>((acc, curr) => {
                acc[curr.tourId] = curr;
                return acc;
            }, {});
        })
    );

    private weekViewTourDragged: {
        originalPosition: number | null;
        originalOffsetY: number | null;
        tour: CalendarTour;
    } | null = null;

    // for events in week and day view
    cEvents$: Observable<CalendarData> = combineLatest([
        this.manageAllocationInventories$,
        this.cruiseLinesObj$,
        this.portsObj$,
        this.toursObj$,
    ]).pipe(
        map(([res, cruiseLines, ports, toursObj]) => {
            const ships: Record<string, CalendarShip[]> = {};
            if (res.ships?.length > 0) {
                let allowedPorts: number[] = [];
                if (
                    res.config.tourId &&
                    res.config.tourId.length > 0 &&
                    toursObj
                ) {
                    allowedPorts = res.config.tourId.map(
                        (tourId) => toursObj[+tourId]?.portId
                    );
                }
                res.ships.forEach((ship) => {
                    // only display ships that are in the list of selected ports
                    if (
                        allowedPorts.length === 0 ||
                        allowedPorts.includes(ship.portId)
                    ) {
                        const regex = /(\d{2}:\d{2} [APM]{2})/g;

                        const matches = ship.title?.match(regex);
                        let endTime = null;
                        if (matches && matches.length >= 2) {
                            endTime = matches[1]; // Assuming the second match is the end time (05:00 PM)
                        }
                        // use the start of the event to find dat
                        const dateTimeString = ship.start;
                        const date = dateTimeString?.split('T')[0];
                        const endEvent = `${date}T${endTime}`;
                        const inputDateTimeStr = endEvent;

                        // Split the input string into date and time parts
                        const [datePart, timePart] =
                            inputDateTimeStr.split('T');
                        const [time, ampm] = timePart.split(' ');

                        // Split the date into year, month, and day
                        const [year, month, day] = datePart.split('-');

                        // Split the time into hours and minutes
                        const [hours, minutes] = time.split(':');

                        // Convert hours to 24-hour format if PM (we need to check against null times)
                        const adjustedHours =
                            ampm?.toLowerCase() === 'pm'
                                ? (parseInt(hours) + 12).toString()
                                : hours;
                        const start = new Date(ship.start || '');

                        const key = this.generateIdFromBreakdown(
                            +year,
                            +month,
                            +day
                        );
                        const outputDateTimeStr = `${key}T${adjustedHours}:${minutes}:00`;
                        const endDate = new Date(outputDateTimeStr);
                        const shipInfo = {
                            id: `ship-${ship.id}`,
                            start: start,
                            end: !adjustedHours || !minutes ? null : endDate,
                            background:
                                (ship.shipCompanyId &&
                                    cruiseLines[ship.shipCompanyId]
                                        ?.shipCompanyBackgroundColor) ||
                                '',
                            color:
                                (ship.shipCompanyId &&
                                    cruiseLines[ship.shipCompanyId]
                                        ?.shipCompanyColor) ||
                                '',
                            description: ship.description,
                            shipId: ship.shipId,
                            shipCompanyId: ship.shipCompanyId,
                            portId: ship.portId,
                            portName: ports?.[ship.portId]?.portName || '',
                            totalBooking: ship.totalBooking,
                            shipCapacity: ship.shipCapacity,
                        };
                        if (key in ships) {
                            ships[key] = [...ships[key], shipInfo];
                        } else {
                            ships[key] = [shipInfo];
                        }
                    }
                });
            }
            const tours: Record<
                string,
                Record<
                    string,
                    {
                        start: Date;
                        tours: CalendarTour[];
                    }
                >
            > = {};
            if (res.tourInventories?.length > 0) {
                res.tourInventories.forEach((tour) => {
                    const regex = /(\d{2}:\d{2} [APM]{2})/g;

                    const matches = tour.title?.match(regex);
                    let endTime = null;
                    if (matches && matches.length >= 2) {
                        endTime = matches[1]; // Assuming the second match is the end time (05:00 PM)
                    }
                    // use the start of the event to find dat
                    const dateTimeString = tour.start;
                    const date = dateTimeString?.split('T')[0];
                    const endEvent = `${date}T${endTime}`;
                    const inputDateTimeStr = endEvent;

                    // Split the input string into date and time parts
                    const datePart = inputDateTimeStr.split('T')?.[0];

                    // Split the date into year, month, and day
                    const [year, month, day] = datePart.split('-');

                    // Split the time into hours and minutes
                    const start = new Date(tour.start || '');
                    const key = this.generateIdFromBreakdown(
                        +year,
                        +month,
                        +day
                    );
                    const tourInfo: CalendarTour = {
                        id: `tour-${tour.id}`,
                        start: start,
                        end: new Date(
                            new Date(start).setHours(start.getHours() + 1)
                        ),
                        background:
                            (tour.shipCompanyId &&
                                cruiseLines[tour.shipCompanyId]
                                    ?.shipCompanyBackgroundColor) ||
                            '#05365420',
                        color:
                            (tour.shipCompanyId &&
                                cruiseLines[tour.shipCompanyId]
                                    ?.shipCompanyColor) ||
                            '#053654',
                        unallocatedTourInventoryId:
                            tour.unallocatedTourInventoryID,
                        tourId: tour.tourID,
                        description: tour.description,
                        portId: tour.portId,
                        shipId: tour.shipId,
                        shipCompanyId: tour.shipCompanyId,
                        cruiseLineName: tour.cruiseLineName,
                        cruiseShipName: tour.cruiseShipName,
                        isReleased: tour.isReleased,
                        isUnallocated: !tour.isReleased && tour.shipId === null,
                        totalBooking: tour.totalBooking,
                    };
                    if (tour.extras) {
                        tourInfo.extras = tour.extras;
                    }

                    let startTime = `${start.getHours()}-${start.getMinutes()}`;
                    const currentFromMidnight =
                        start.getHours() * 60 + start.getMinutes();
                    const closestStartTime =
                        key in tours &&
                        Object.keys(tours[key]).find((tour) => {
                            const [hrs, mins] = tour.split('-');
                            const fromMidnight = +hrs * 60 + +mins;
                            if (currentFromMidnight - fromMidnight < 30) {
                                return true;
                            }
                            return false;
                        });
                    if (closestStartTime) {
                        startTime = closestStartTime;
                    }

                    if (key in tours) {
                        if (startTime in tours[key]) {
                            tours[key] = {
                                ...tours[key],
                                [startTime]: {
                                    ...tours[key][startTime],
                                    tours: [
                                        ...tours[key][startTime].tours,
                                        tourInfo,
                                    ].sort((a, b) =>
                                        a.start.getTime() - b.start.getTime() <
                                        0
                                            ? -1
                                            : 1
                                    ),
                                },
                            };
                        } else {
                            tours[key] = {
                                ...tours[key],
                                [startTime]: {
                                    start: start,
                                    tours: [tourInfo],
                                },
                            };
                        }
                    } else {
                        tours[key] = {
                            [startTime]: {
                                start: start,
                                tours: [tourInfo],
                            },
                        };
                    }
                });
            }
            return { ships, tours };
        })
    );

    // for events in month view
    calendarEvents$: Observable<CalendarMonthDay[]> = combineLatest([
        this.manageAllocationInventories$,
        this.cruiseLinesObj$,
    ]).pipe(
        map(([res, cruiseLines]) => {
            const tours = res.tourInventories?.map((item) => {
                // use the start of the event to find dat
                const dateTimeString = item.start;
                const date = dateTimeString?.split('T')[0];

                const start = new Date(item.start || '');
                return {
                    id: item.id.toString(),
                    start: start,
                    end: new Date(
                        new Date(start).setHours(start.getHours() + 0.5)
                    ),
                    title: item.description || '',
                    color: {
                        primary: '',
                        secondary: '',
                    },
                    meta: {
                        start: start,
                        shipId: item.shipId,
                        shipCompanyId: item.shipCompanyId,
                        cruiseLineName: item.cruiseLineName,
                        cruiseShipName: item.cruiseShipName,
                        isReleased: item.isReleased,
                        background:
                            item.shipCompanyId !== null
                                ? cruiseLines[item.shipCompanyId]
                                      ?.shipCompanyBackgroundColor || ''
                                : '',
                        color:
                            item.shipCompanyId !== null
                                ? cruiseLines[item.shipCompanyId]
                                      ?.shipCompanyColor || ''
                                : '',
                        date: date,
                        description: item.description,
                        extras: {
                            seatsSold: item.seatsSold || 0,
                            seatsAllocated: item.totalUnallocatedSeatTour || 0,
                        },
                    },
                };
            });
            return tours;
        })
    );

    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        combineLatest([
            this.startDate$.pipe(distinctUntilChanged()),
            this.manageAllocationInventories$.pipe(
                map((config) => config.calendarCurrentViewDate),
                distinctUntilChanged()
            ),
        ])
            .pipe(takeUntil(this.destroyed$))
            .subscribe(([startDate, currentViewDate]) => {
                if (currentViewDate) {
                    this.viewDate = currentViewDate;
                    return;
                }
                if (startDate) {
                    this.viewDate = startDate;
                }
            });
        this.operatorFiltersState.getCruiseLines();
        this.operatorFiltersState.getPorts();
        this.operatorFiltersState.getTours();
        this.manageAllocationInventories$
            .pipe(
                takeUntil(this.destroyed$),
                distinctUntilChanged(
                    (prev, curr) =>
                        JSON.stringify(prev) === JSON.stringify(curr)
                )
            )
            .subscribe(() => {
                this.setData();
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    setView(view: CalendarView): void {
        this.view = view;
        this.viewChange.emit(view);
        this.setData();
    }

    onViewDateChange(updatedViewDate: Date): void {
        this.viewDate = updatedViewDate;
        this.viewDateChange.emit(updatedViewDate);
        this.setData();
    }

    onAddClicked(): void {
        this.addClicked.emit();
    }

    onWeekViewDragStart(args: { event: DragEvent; tour: CalendarTour }): void {
        const targetElement = args.event.target as HTMLElement;
        if (!targetElement) {
            return;
        }
        this.weekViewTourDragged = {
            tour: args.tour,
            originalOffsetY: window.scrollY,
            originalPosition: args.event.clientY,
        };
        targetElement.style.opacity = '0.2';
    }

    onWeekViewDrop(args: { event: DragEvent; targetDate: string }): void {
        if (
            this.weekViewTourDragged &&
            this.weekViewTourDragged.originalPosition !== null
        ) {
            const currentOffsetTop = window.scrollY;
            const positionChange =
                args.event.clientY -
                this.weekViewTourDragged.originalPosition +
                (currentOffsetTop -
                    (this.weekViewTourDragged.originalOffsetY || 0));
            const startTime = this.weekViewTourDragged.tour.start;
            const hoursSinceStartOfDay =
                startTime.getHours() * 60 + startTime.getMinutes();
            const proposedTimeChange = hoursSinceStartOfDay + positionChange;
            let newHour = Math.floor(proposedTimeChange / 60);

            const newMinutes = proposedTimeChange % 60;
            // if it's going to be rounded to the next hour, make sure to add an hour to the hours variable
            if (newMinutes > 52.5) {
                newHour += 1;
            }
            // round to nearest 15 minute interval
            const roundedNewMinutes = (Math.round(newMinutes / 15) * 15) % 60;

            const [year, month, date] = args.targetDate.split('-');
            const proposedDateTime = new Date();
            proposedDateTime.setDate(+date);
            proposedDateTime.setMonth(+month - 1);
            proposedDateTime.setFullYear(+year);
            proposedDateTime.setHours(newHour, roundedNewMinutes);
            if (this.moveInventory) {
                this.moveInventory.emit({
                    tour: this.weekViewTourDragged.tour,
                    proposedDateTime,
                });
            }
            this.weekViewTourDragged = null;
        }
    }

    private setData() {
        const weekCells: EmptyCell[] = [];

        if (this.view === CalendarView.Week) {
            // by default, this returns monday, but we display the start of the week as sunday
            // manually adjust this to sunday by subtracting 1 from the  date
            const startDay = this.setToSunday(this.viewDate);
            startDay.setDate(startDay.getDate() - 1);
            for (let i = 0; i < 8; i++) {
                const id = this.generateId(startDay);
                weekCells.push({
                    id: id,
                    title: '',
                    start: new Date(`${id}T00:00:00`),
                    end: new Date(`${id}T23:59:59`),
                });
                startDay.setDate(startDay.getDate() + 1);
            }
            this.emptyCells$.next(weekCells);
        } else if (this.view === CalendarView.Day) {
            const startDay = new Date(this.viewDate);
            const id = this.generateId(startDay);
            this.emptyCells$.next([
                {
                    id: id,
                    title: '',
                    start: new Date(`${id}T00:00:00`),
                    end: new Date(`${id}T23:59:59`),
                },
            ]);
        }
    }

    private generateId(date: Date): string {
        const year = date.getFullYear();
        const month = `0${date.getMonth() + 1}`.slice(-2);
        const day = `0${date.getDate()}`.slice(-2);
        return `${year}-${month}-${day}`;
    }

    private generateIdFromBreakdown(
        year: number,
        month: number,
        date: number
    ): string {
        const monthFormatted = `0${month}`.slice(-2);
        const dayFormatted = `0${date}`.slice(-2);
        return `${year}-${monthFormatted}-${dayFormatted}`;
    }

    private setToSunday(date: Date): Date {
        const day = date.getDay();
        const diff = date.getDate() - day;
        return new Date(date.setDate(diff));
    }
}
