import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
    AllocationTableComponent,
    TableControlsComponent,
    AllocationListComponent,
} from './components';
import { DividerModule } from 'primeng/divider';
import { AllocationReminderComponent } from './components/';
import { AllocationState, UIState } from './state';
import { BehaviorSubject, Subject, map, takeUntil } from 'rxjs';
import {
    InventoryManagementItem,
    NeededAllocationTourInventoryFilters,
    NeededAllocationTourInventoryReminderItem,
} from '@app/core';
import { AccordionModule } from 'primeng/accordion';
import { LoaderEmbedComponent } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-needing-allocation',
    templateUrl: './needing-allocation.component.html',
    styleUrls: ['./needing-allocation.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        AccordionModule,
        TableControlsComponent,
        AllocationTableComponent,
        AllocationListComponent,
        DividerModule,
        AllocationReminderComponent,
        LoaderEmbedComponent,
    ],
    providers: [AllocationState, UIState],
})
export class NeedingAllocationComponent {
    needingAllocationState = inject(AllocationState);
    activatedRoute = inject(ActivatedRoute);
    router = inject(Router);

    allocationDataLoading$ =
        this.needingAllocationState.needingAllocationStatus$.pipe(
            map((data) => data.inventories)
        );
    filterIsOpen$ = new BehaviorSubject<boolean>(true);

    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.needingAllocationState.init();

        this.activatedRoute.queryParams
            .pipe(takeUntil(this.destroyed$))
            .subscribe((queryParams) => {
                const filters = queryParams['filters'];
                if (filters) {
                    try {
                        const parsedFilters = JSON.parse(
                            atob(filters)
                        ) as NeededAllocationTourInventoryFilters;
                        this.needingAllocationState.updateNeedingAllocationConfig(
                            parsedFilters
                        );
                    } catch {
                        // not sure where to redirect here
                        this.router.navigate([
                            '/operator/inventory-management/needing-allocation',
                        ]);
                    }
                } else {
                    this.router.navigate([
                        '/operator/inventory-management/needing-allocation',
                    ]);
                    this.needingAllocationState.resetFilters();
                }
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
}

export interface InventoryManagementItemExtended {
    item: InventoryManagementItem;
    reminderItem: NeededAllocationTourInventoryReminderItem;
    adjustedDate: string;
    isReminderSet: boolean;
    isReminderOverdue: boolean;
    isReminderSoon: boolean;
}
