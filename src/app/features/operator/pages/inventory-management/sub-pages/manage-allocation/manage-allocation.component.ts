import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    AddUnallocatedInventoryInventoryModalComponent,
    AllocateInventoryModalComponent,
    AllocateSelectedInventoryModalComponent,
    AvailableInventoryListComponent,
    AvailableInventoryTableComponent,
    CalendarControlsComponent,
    DeleteInventoryModalComponent,
    DeleteSelectedInventoryModalComponent,
    EditInventoryModalComponent,
    EditSelectedAllocatedInventoryModalComponent,
    EditSelectedUnallocatedInventoryModalComponent,
    MoveSelectedInventoryModalComponent,
    ReleaseInventoryModalComponent,
    ReleaseSelectedInventoryModalComponent,
} from './components';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { UIState } from './state/ui.state';
import { ManageAllocationState } from './state';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Subject, map, takeUntil } from 'rxjs';
import {
    AllocationUnallocateTourSearch,
    Features,
    adjustDate,
} from '@app/core';
import {
    LoaderEmbedComponent,
    PermissionDirective,
    InventoryCalendarComponent,
    CalendarShip,
    CalendarTour,
} from '@app/shared';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { QuickActionsState } from './state/quick-actions.state';
import { CalendarView } from 'angular-calendar';

type ViewOption = 'table' | 'calendar';
@Component({
    standalone: true,
    selector: 'app-manage-allocation',
    templateUrl: './manage-allocation.component.html',
    styleUrls: ['./manage-allocation.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        AccordionModule,
        CalendarControlsComponent,
        InventoryCalendarComponent,
        ButtonModule,
        DividerModule,
        MenuModule,
        SelectButtonModule,
        AvailableInventoryTableComponent,
        AvailableInventoryListComponent,
        LoaderEmbedComponent,
        PermissionDirective,
        // modals
        AddUnallocatedInventoryInventoryModalComponent,
        AllocateInventoryModalComponent,
        DeleteInventoryModalComponent,
        ReleaseInventoryModalComponent,
        EditInventoryModalComponent,
        DeleteSelectedInventoryModalComponent,
        ReleaseSelectedInventoryModalComponent,
        AllocateSelectedInventoryModalComponent,
        EditSelectedAllocatedInventoryModalComponent,
        EditSelectedUnallocatedInventoryModalComponent,
        MoveSelectedInventoryModalComponent,
    ],
    providers: [UIState, ManageAllocationState, QuickActionsState],
})
export class ManageAllocationComponent {
    activatedRoute = inject(ActivatedRoute);
    router = inject(Router);
    manageAllocationState = inject(ManageAllocationState);
    quickActionsState = inject(QuickActionsState);
    uiState = inject(UIState);
    manageAllocationInventories$ =
        this.manageAllocationState.manageAllocationInventories$;
    features = Features;
    selectedViewOption: ViewOption = 'calendar';
    defaultCalendarView: CalendarView = CalendarView.Month;
    filterIsOpen$ = new BehaviorSubject<boolean>(false);

    calendarConfig$ =
        this.manageAllocationState.manageAllocationInventories$.pipe(
            map((data) => ({
                config: {
                    tourId: data.config.tourId || [],
                    startDate: data.config.startDate
                        ? adjustDate(new Date(data.config.startDate))
                        : new Date(),
                },
                tourInventories: data.data || [],
                ships: data.ships || [],
                calendarCurrentViewDate: data.calendarCurrentViewDate,
            }))
        );

    dataOptions: MenuItem[] = [
        {
            label: 'Add Unallocated Inventory',
            icon: 'pi pi-plus',
            command: () => {
                this.openAddUnallocatedInventoryModal();
            },
        },
        {
            label: 'Add Allocated Inventory',
            icon: 'pi pi-plus',
            command: () => {
                this.openAllocateInventoryModal();
            },
        },
        {
            label: 'Edit Inventory',
            icon: 'pi pi-pencil',
            command: () => {
                this.openEditInventoryModal();
            },
        },
        {
            label: 'Release Inventory',
            icon: 'pi pi-check',
            command: () => {
                this.openReleaseInventoryModal();
            },
        },
        {
            label: 'Delete Inventory',
            icon: 'pi pi-trash',
            command: () => {
                this.openReleaseInventoryModal();
            },
        },
    ];

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.activatedRoute.queryParamMap
            .pipe(takeUntil(this.destroyed$))
            .subscribe(async (queryParams) => {
                const filters = queryParams.get('filters');
                if (filters) {
                    try {
                        const parsedFilters = JSON.parse(
                            atob(filters)
                        ) as AllocationUnallocateTourSearch;
                        await this.manageAllocationState.updateAllocationUnallocatedConfig(
                            parsedFilters
                        );
                    } catch {
                        this.router.navigate([
                            '/operator/inventory-management/manage-allocation',
                        ]);
                    }
                } else {
                    this.router.navigate([
                        '/operator/inventory-management/manage-allocation',
                    ]);
                }
                this.manageAllocationState.init();

                // uncomment the following line if we want to always default to month on every
                // filter update
                // this.defaultCalendarView = CalendarView.Month;
            });
    }
    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    selectViewOption(viewOption: ViewOption): void {
        this.selectedViewOption = viewOption;
    }

    onViewChange(view: CalendarView): void {
        this.defaultCalendarView = view;
    }

    openAddUnallocatedInventoryModal(): void {
        this.uiState.openAddUnallocatedInventoryModal();
    }

    openAllocateInventoryModal(): void {
        const currentFilters =
            this.manageAllocationInventories$.getValue().config;
        this.uiState.openAllocateInventoryModal({
            shipCompanyId: currentFilters.shipCompanyId || null,
            shipId: currentFilters.shipId || null,
            tourId:
                currentFilters.tourId && currentFilters.tourId.length > 0
                    ? +currentFilters.tourId[0]
                    : null,
            portId: currentFilters.portId || 0,
            fromDate: currentFilters.startDate,
            toDate: currentFilters.endDate,
            fromTime: '00:00:00',
            toTime: '23:59:59',
            days: '',
            isBiWeekly: false,
        });
    }

    openEditInventoryModal() {
        const currentFilters =
            this.manageAllocationInventories$.getValue().config;
        this.uiState.opeEditInventoryModal({
            searchBy: currentFilters.searchType || 'ALL',
            shipCompanyId: currentFilters.shipCompanyId || null,
            shipId: currentFilters.shipId || 0,
            tourId:
                currentFilters.tourId && currentFilters.tourId.length > 0
                    ? +currentFilters.tourId[0]
                    : null,
            portId: currentFilters.portId || 0,
            fromDate: currentFilters.startDate,
            toDate: currentFilters.endDate,
            fromTime: '00:00:00',
            toTime: '23:59:59',
            days: '',
            isBiWeekly: false,
        });
    }

    openReleaseInventoryModal() {
        const currentFilters =
            this.manageAllocationInventories$.getValue().config;
        this.uiState.openReleaseInventoryModal({
            shipCompanyId: currentFilters.shipCompanyId || null,
            shipId: currentFilters.shipId || null,
            tourId:
                currentFilters.tourId && currentFilters.tourId.length > 0
                    ? +currentFilters.tourId[0]
                    : null,
            portId: currentFilters.portId || 0,
            fromDate: currentFilters.startDate,
            toDate: currentFilters.endDate,
            fromTime: '00:00:00',
            toTime: '23:59:59',
        });
    }

    openDeleteInventoryModal() {
        const currentFilters =
            this.manageAllocationInventories$.getValue().config;
        this.uiState.openDeleteInventoryModal({
            searchBy: currentFilters.searchType || 'ALL',
            shipCompanyId: currentFilters.shipCompanyId || null,
            shipId: currentFilters.shipId || 0,
            tourId:
                currentFilters.tourId && currentFilters.tourId.length > 0
                    ? +currentFilters.tourId[0]
                    : null,
            portId: currentFilters.portId || 0,
            fromDate: currentFilters.startDate,
            toDate: currentFilters.endDate,
            fromTime: '00:00:00',
            toTime: '23:59:59',
            days: '',
            isBiWeekly: false,
        });
    }

    onAddClicked(): void {
        this.uiState.openAddUnallocatedInventoryModal();
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

    onAllocateInventory(data: {
        tour: CalendarTour;
        ships: CalendarShip[];
    }): void {
        this.uiState.openAllocateSelectedInventory(data.tour, data.ships);
    }

    onReleaseInventory(tour: CalendarTour): void {
        this.uiState.openReleaseSelectedInventory(tour);
    }

    onDeleteInventory(tour: CalendarTour): void {
        this.uiState.openDeleteSelectedInventory(tour);
    }

    onEditInventory(data: { tour: CalendarTour; ships: CalendarShip[] }): void {
        this.uiState.openEditSelectedInventory(data.tour, data.ships);
    }

    onMoveInventory(data: {
        tour: CalendarTour;
        proposedDateTime: Date;
    }): void {
        this.uiState.openMoveSelectedInventory(data);
    }

    onViewDateChange(date: Date): void {
        this.manageAllocationState.updateCalendarCurrentViewDate(date);
    }
}
