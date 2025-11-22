import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subject, map, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AccordionModule } from 'primeng/accordion';
import { CalendarView } from 'angular-calendar';
import {
    AllocationUnallocateTourSearch,
    Features,
    adjustDate,
    toTourInventoryItem,
} from '@app/core';
import {
    CalendarShip,
    CalendarTour,
    InventoryCalendarComponent,
    LoaderEmbedComponent,
    PermissionDirective,
} from '@app/shared';
import { TourInventoryState, UIState } from './state';
import {
    AvailableInventoryTableComponent,
    CalendarControlsComponent,
    DeleteSelectedReleasedInventoryModalComponent,
    EditSelectedReleasedInventoryModalComponent,
} from './components';

type ViewOption = 'table' | 'calendar';
@Component({
    standalone: true,
    selector: 'app-tour-inventory',
    templateUrl: './tour-inventory.component.html',
    styleUrls: ['./tour-inventory.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        AccordionModule,
        CalendarControlsComponent,
        ButtonModule,
        DividerModule,
        SelectButtonModule,
        AvailableInventoryTableComponent,
        LoaderEmbedComponent,
        PermissionDirective,
        InventoryCalendarComponent,

        // modals
        EditSelectedReleasedInventoryModalComponent,
        DeleteSelectedReleasedInventoryModalComponent,
    ],
    providers: [UIState, TourInventoryState],
})
export class TourInventoryComponent {
    activatedRoute = inject(ActivatedRoute);
    router = inject(Router);
    tourInventoryState = inject(TourInventoryState);
    uiState = inject(UIState);
    manageAllocationInventories$ =
        this.tourInventoryState.manageAllocationInventories$;
    features = Features;
    selectedViewOption: ViewOption = 'table';
    defaultCalendarView: CalendarView = CalendarView.Week;
    filterIsOpen$ = new BehaviorSubject<boolean>(false);

    calendarConfig$ = this.tourInventoryState.manageAllocationInventories$.pipe(
        map((data) => ({
            config: {
                tourId: data.config.tourId || [],
                startDate: data.config.startDate
                    ? adjustDate(new Date(data.config.startDate))
                    : new Date(),
            },
            tourInventories:
                data.data.map((tour) => toTourInventoryItem(tour)) || [],
            ships: data.ships || [],
            calendarCurrentViewDate: data.calendarCurrentViewDate,
        }))
    );

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
                        await this.tourInventoryState.updateAllocationUnallocatedConfig(
                            parsedFilters
                        );
                    } catch {
                        this.router.navigate([
                            '/operator/booking-management/tour-inventory',
                        ]);
                    }
                } else {
                    this.router.navigate([
                        '/operator/booking-management/tour-inventory',
                    ]);
                }
                this.tourInventoryState.init();

                // uncomment the following line if we want to always default to month on every
                // filter update
                // this.defaultCalendarView = CalendarView.Month;
            });
    }
    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onEditInventory(data: { tour: CalendarTour; ships: CalendarShip[] }): void {
        const selectedTour =
            this.tourInventoryState.manageAllocationInventories$
                .getValue()
                .data.find(
                    (tour) =>
                        tour.tourInventoryID ===
                        data.tour.unallocatedTourInventoryId
                );
        if (selectedTour) {
            this.uiState.openEditSelectedReleasedInventoryModal(selectedTour);
        }
    }

    onDeleteInventory(data: CalendarTour): void {
        const selectedTour =
            this.tourInventoryState.manageAllocationInventories$
                .getValue()
                .data.find(
                    (tour) =>
                        tour.tourInventoryID === data.unallocatedTourInventoryId
                );
        if (selectedTour) {
            this.uiState.openDeleteSelectedReleasedInventoryModal(selectedTour);
        }
    }

    selectViewOption(viewOption: ViewOption): void {
        this.selectedViewOption = viewOption;
    }

    onViewChange(view: CalendarView): void {
        this.defaultCalendarView = view;
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

    onViewDateChange(date: Date): void {
        this.tourInventoryState.updateCalendarCurrentViewDate(date);
    }

    exportExcel(): void {
        this.tourInventoryState.exportExcel();
    }
}
