import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import {
    BehaviorSubject,
    Subject,
    combineLatest,
    distinctUntilChanged,
    filter,
    from,
    map,
    of,
    switchMap,
    takeUntil,
} from 'rxjs';
import { AssignmentsState, UIState } from '../../state';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ChipsModule } from 'primeng/chips';
import { MultiSelectModule } from 'primeng/multiselect';
import { AccordionModule } from 'primeng/accordion';
import {
    AssignmentFilter,
    CalendarScheduleState,
    CruiseEvents,
    Features,
    OperatorFiltersState,
    ShipCompany,
    isMobile,
} from '@app/core';
import { IconCruiseComponent, PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-dtd-table-controls',
    templateUrl: './dtd-table-controls.component.html',
    styleUrls: ['./dtd-table-controls.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarModule,
        InputTextModule,
        ButtonModule,
        InputSwitchModule,
        DividerModule,
        DropdownModule,
        ChipsModule,
        MultiSelectModule,
        AccordionModule,
        PermissionDirective,
        IconCruiseComponent,
    ],
})
export class DtdTableControlsComponent {
    assignmentState = inject(AssignmentsState);
    calendarScheduleState = inject(CalendarScheduleState);
    operatorFiltersState = inject(OperatorFiltersState);
    uiState = inject(UIState);
    isMobile = isMobile();
    config$ = this.assignmentState.configs$;
    ports$ = this.operatorFiltersState.ports$;
    tours$ = this.operatorFiltersState.tours$;
    condensedView$ = combineLatest([
        this.assignmentState.configs$,
        this.assignmentState.viewportSize$,
    ]).pipe(
        map(([config, viewportSize]) => {
            return (
                config.viewMode === 'table' &&
                viewportSize &&
                viewportSize < 640
            );
        })
    );
    isRefreshing$ = this.assignmentState.status$.pipe(
        map((status) => status.loadAssignments === 'loading')
    );

    features = Features;

    hasFiltersApplied$ = combineLatest([
        this.assignmentState.configs$,
        this.tours$,
        this.ports$,
        this.isRefreshing$,
    ]).pipe(
        map(
            ([config, tours, ports, isRefreshing]) =>
                !isRefreshing &&
                tours &&
                ports &&
                config.filters != null &&
                (('tourIds' in config.filters &&
                    config.filters.tourIds?.length !== tours.length) ||
                    ('portIds' in config.filters &&
                        config.filters.portIds?.length !== ports.length) ||
                    ('dockId' in config.filters &&
                        config.filters.dockId !== 0) ||
                    ('driverId' in config.filters &&
                        config.filters.driverId !== 0) ||
                    ('shipCompanyId' in config.filters &&
                        config.filters.shipCompanyId !== 0) ||
                    ('shipId' in config.filters && config.filters.shipId !== 0))
        )
    );
    loadingSavedFilterPreference$ = this.assignmentState.status$.pipe(
        map((status) => status.loadSavedFilterPreference)
    );
    savingFilterPreferences$ = this.assignmentState.status$.pipe(
        map((status) => status.savingPreferences)
    );
    filterLoading$ = this.operatorFiltersState.isLoading$;
    tableFilterForm = new FormGroup({
        cruiseLine: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        ship: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        guide: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        dock: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        tours: new FormControl<number[] | null>(null, {
            nonNullable: true,
        }),
        ports: new FormControl<number[] | null>(null, {
            nonNullable: true,
        }),
    });
    selectedDate = new Date();
    orderByTour = false;
    autoRefresh = false;
    hideConfirmedAndCanceled = false;
    condensedView = false;

    filterIsOpen$ = new BehaviorSubject<boolean>(false);
    guides$ = this.operatorFiltersState.guides$.pipe(
        map((guide) => {
            return [
                {
                    guideFirstNameNickname: 'All Guides',
                    guideId: 0,
                },
                ...guide,
            ];
        })
    );
    docks$ = this.operatorFiltersState.docks$.pipe(
        map((dock) => {
            return [
                {
                    dockName: 'All Docks',
                    dockId: 0,
                },
                ...dock,
            ];
        })
    );
    cruiseLines$ = this.operatorFiltersState.cruiseLines$.pipe(
        map((cruiseLine) => {
            return [
                {
                    shipCompanyName: 'All Cruise Lines',
                    shipCompanyId: null,
                },
                ...cruiseLine,
            ];
        })
    );
    cruiseShips$ = this.tableFilterForm.controls.cruiseLine.valueChanges.pipe(
        switchMap((cruiseLine) => {
            if (cruiseLine === null || cruiseLine === 0) {
                return of([]);
            }
            const cruiseShips =
                this.operatorFiltersState.cruiseShips$.getValue();
            if (cruiseShips?.[cruiseLine]) {
                return of(cruiseShips[cruiseLine]);
            } else {
                return from(this.operatorFiltersState.getShipList(cruiseLine));
            }
        })
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
    dailyCruiseSchedule$ = combineLatest([
        this.assignmentState.dailyCruiseSchedule$,
        this.cruiseLinesObj$,
        this.assignmentState.configs$.pipe(
            map((config) => config.filters?.shipId),
            distinctUntilChanged()
        ),
    ]).pipe(
        map(([cruiseSchedule, cruiseLineDetails, selectedShipFilter]) => {
            if (!cruiseLineDetails || !cruiseSchedule) {
                return [];
            }
            return cruiseSchedule.map((cruise) => {
                let opacity = 1;
                let isSelected = false;
                if (
                    selectedShipFilter &&
                    selectedShipFilter === cruise.shipId
                ) {
                    isSelected = true;
                }
                if (
                    selectedShipFilter &&
                    selectedShipFilter !== cruise.shipId
                ) {
                    opacity = 0.3;
                }

                return {
                    ...cruise,
                    backgroundColor:
                        (cruise.shipCompanyId &&
                            cruiseLineDetails[cruise.shipCompanyId]
                                ?.shipCompanyBackgroundColor) ||
                        '#05365420',
                    color:
                        (cruise.shipCompanyId &&
                            cruiseLineDetails[cruise.shipCompanyId]
                                ?.shipCompanyColor) ||
                        '#053654',
                    opacity,
                    isSelected,
                };
            });
        })
    );

    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.operatorFiltersState.getCruiseLines();
        this.operatorFiltersState.getGuides();
        this.operatorFiltersState.getTours();
        this.operatorFiltersState.getPorts();
        this.operatorFiltersState.getDocks();

        combineLatest([
            this.config$,
            this.tours$,
            this.ports$,
            this.loadingSavedFilterPreference$,
        ])
            .pipe(
                filter(
                    ([_config, tours, ports, loadingSavedFilterPreference]) => {
                        return (
                            loadingSavedFilterPreference !== 'loading' &&
                            tours?.length > 0 &&
                            ports?.length > 0
                        );
                    }
                ),
                distinctUntilChanged((prev, curr) => {
                    return (
                        prev[0].dateSelected === curr[0].dateSelected &&
                        JSON.stringify(prev[0].filters) ===
                            JSON.stringify(curr[0].filters) &&
                        prev[0].autoRefresh === curr[0].autoRefresh &&
                        prev[0].hideConfirmedAndCanceled ===
                            curr[0].hideConfirmedAndCanceled &&
                        prev[0].viewMode === curr[0].viewMode
                    );
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe(async ([config, tours, ports]) => {
                if (config.dateSelected) {
                    this.selectedDate = config.dateSelected;
                }
                const activeFilters = config.filters;
                this.autoRefresh = config.autoRefresh;
                this.hideConfirmedAndCanceled = config.hideConfirmedAndCanceled;
                if (activeFilters) {
                    if (activeFilters.shipCompanyId) {
                        await this.operatorFiltersState.getShipList(
                            activeFilters.shipCompanyId
                        );
                    }
                    // auto open filter panel if there is an active filter applied (disabling this for now)
                    // this.filterIsOpen$.next(true);
                    this.orderByTour = activeFilters.sortDirection === 'DESC';
                    this.hideConfirmedAndCanceled =
                        config.hideConfirmedAndCanceled;
                    const selectedPorts = activeFilters.portIds
                        ?.map((portId) => +portId)
                        .filter(
                            (portId) =>
                                ports.findIndex(
                                    (port) => port.portId === portId
                                ) >= 0
                        );
                    if (selectedPorts && selectedPorts.length > 0) {
                        this.assignmentState.loadDailyCruiseSchedule(
                            this.selectedDate,
                            selectedPorts
                        );
                    }
                    const selectedTours = activeFilters.tourIds
                        ?.map((tourId) => +tourId)
                        .filter(
                            (tourId) =>
                                tours.findIndex(
                                    (tour) => tour.tourId === tourId
                                ) >= 0
                        );
                    this.tableFilterForm.patchValue({
                        ports:
                            selectedPorts && selectedPorts.length > 0
                                ? selectedPorts
                                : ports.map((port) => port.portId) || [],
                        tours:
                            selectedTours && selectedTours.length > 0
                                ? selectedTours
                                : tours.map((tour) => tour.tourId) || [],
                        dock: activeFilters.dockId || 0,
                        guide: activeFilters.driverId || 0,
                        cruiseLine:
                            activeFilters.shipCompanyId !== null &&
                            activeFilters.shipCompanyId !== undefined &&
                            activeFilters.shipCompanyId >= 0
                                ? activeFilters.shipCompanyId
                                : null,
                        ship: activeFilters.shipId || null,
                    });
                } else {
                    this.orderByTour = false;
                    this.tableFilterForm.patchValue({
                        ports: ports.map((port) => port.portId) || [],
                        tours: tours.map((tour) => tour.tourId) || [],
                        dock: 0,
                        guide: 0,
                        cruiseLine: null,
                        ship: null,
                    });
                }
            });
    }

    arrivingCruiseDescription$ = combineLatest([
        this.config$,
        this.ports$,
    ]).pipe(
        map(([config, portDetails]) => {
            if (!portDetails) {
                return '';
            }
            if (
                !config.filters?.portIds ||
                config.filters.portIds.length === 0
            ) {
                return 'Cruises arrving in all ports';
            }
            const portNames = config.filters.portIds.map(
                (portId) =>
                    portDetails
                        .find((port) => port.portId === +portId)
                        ?.portName?.split(',')?.[0]
            );
            return `Cruises arriving in ${portNames.join(', ')}`;
        })
    );

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    orderByTourChange(): void {
        this.assignmentState.searchAssignments(this.getFormattedFilters(), {
            autoRefresh: this.autoRefresh,
            hideConfirmedAndCanceled: this.hideConfirmedAndCanceled,
        });
    }

    search(): void {
        this.assignmentState.searchAssignments(this.getFormattedFilters(), {
            autoRefresh: this.autoRefresh,
            hideConfirmedAndCanceled: this.hideConfirmedAndCanceled,
        });
    }

    saveFilters(): void {
        this.assignmentState.saveFilterPreference(this.getFormattedFilters());
    }

    onSelectedDateChange(args: Date): void {
        if (args) {
            this.assignmentState.updateDateSelected(args, {
                autoRefresh: this.autoRefresh,
                hideConfirmedAndCanceled: this.hideConfirmedAndCanceled,
            });
        }
    }

    autoRefreshChange(): void {
        this.assignmentState.searchAssignments(this.getFormattedFilters(), {
            autoRefresh: this.autoRefresh,
            hideConfirmedAndCanceled: this.hideConfirmedAndCanceled,
        });
    }

    hideConfirmedAndCanceledChange(): void {
        this.assignmentState.searchAssignments(this.getFormattedFilters(), {
            autoRefresh: this.autoRefresh,
            hideConfirmedAndCanceled: this.hideConfirmedAndCanceled,
        });
    }

    condensedViewChange(): void {
        this.assignmentState.searchAssignments(this.getFormattedFilters(), {
            autoRefresh: this.condensedView ? false : this.autoRefresh,
        });
    }

    toggleFilterDrawer(): void {
        if (this.filterIsOpen$.getValue() === true) {
            this.closeFilterDrawer();
        } else {
            this.openFiltersDrawer();
        }
    }

    openFiltersDrawer(): void {
        this.filterIsOpen$.next(true);
    }

    closeFilterDrawer(): void {
        this.filterIsOpen$.next(false);
    }

    openSharePDFModal(): void {
        this.uiState.openSharePDFModal(this.getFormattedFilters());
    }

    downloadPdf(): void {
        this.assignmentState.downloadPdf();
    }

    selectShip(ship: CruiseEvents): void {
        if (ship && ship.shipCompanyId && ship.shipId) {
            this.tableFilterForm.patchValue({
                cruiseLine: ship.shipCompanyId,
                ship: ship.shipId,
            });
            this.search();
        }
    }

    resetShipSelection(): void {
        this.tableFilterForm.patchValue({
            cruiseLine: null,
            ship: null,
        });
        this.search();
    }

    clearFilters(): void {
        this.tableFilterForm.reset(
            {
                guide: 0,
                dock: 0,
                cruiseLine: null,
                ship: null,
                ports: [],
                tours: [],
            },
            { emitEvent: false }
        );
    }

    previousDay(): void {
        const currentSelectedDate =
            this.assignmentState.configs$.getValue().dateSelected;
        if (!currentSelectedDate) {
            return;
        }
        currentSelectedDate.setDate(currentSelectedDate.getDate() - 1);
        this.assignmentState.updateDateSelected(currentSelectedDate, {
            autoRefresh: this.autoRefresh,
        });
    }

    nextDay(): void {
        const currentSelectedDate =
            this.assignmentState.configs$.getValue().dateSelected;
        if (!currentSelectedDate) {
            return;
        }
        currentSelectedDate.setDate(currentSelectedDate.getDate() + 1);
        this.assignmentState.updateDateSelected(currentSelectedDate, {
            autoRefresh: this.autoRefresh,
        });
    }

    refresh(): void {
        this.assignmentState.refresh();
    }

    private getFormattedFilters(): AssignmentFilter {
        const formValues = this.tableFilterForm.getRawValue();
        const formattedFilters: AssignmentFilter = {};
        formattedFilters.sortDirection = this.orderByTour ? 'DESC' : 'ASC';

        if (formValues.ports && formValues.ports.length > 0) {
            formattedFilters.portIds = formValues.ports.map((portId) =>
                portId.toString()
            );
        } else {
            // default to all ports if no ports are selected
            formattedFilters.portIds = this.ports$
                .getValue()
                .map((port) => port.portId.toString());
        }

        if (formValues.tours && formValues.tours.length > 0) {
            formattedFilters.tourIds = formValues.tours.map((tourId) =>
                tourId.toString()
            );
        } else {
            // default to all tours if no tours are selected
            formattedFilters.tourIds = this.tours$
                .getValue()
                .map((tour) => tour.tourId.toString());
        }
        formattedFilters.driverId = formValues.guide || 0;
        formattedFilters.dockId = formValues.dock || 0;
        formattedFilters.shipCompanyId = formValues.cruiseLine;
        if (formValues.cruiseLine === null || formValues.cruiseLine === 0) {
            formattedFilters.shipId = null;
        } else {
            formattedFilters.shipId = formValues.ship || null;
        }
        return formattedFilters;
    }
}
