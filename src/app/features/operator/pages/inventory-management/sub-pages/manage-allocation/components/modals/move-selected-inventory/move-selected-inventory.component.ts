import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    Subject,
    distinctUntilChanged,
    map,
    BehaviorSubject,
    takeUntil,
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { OperatorFiltersState, UIStatus } from '@app/core';
import { CalendarTour } from '@app/shared';
import { UIState, QuickActionsState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-move-selected-inventory-modal',
    templateUrl: './move-selected-inventory.component.html',
    styleUrls: ['./move-selected-inventory.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        ButtonModule,
        CalendarModule,
        InputNumberModule,
        DropdownModule,
    ],
})
export class MoveSelectedInventoryModalComponent {
    uiState = inject(UIState);
    quickActionsState = inject(QuickActionsState);
    operatorFiltersState = inject(OperatorFiltersState);
    openMoveSelectedInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.moveSelectedInventory),
        distinctUntilChanged()
    );
    isOpen$ = this.openMoveSelectedInventoryModal$.pipe(
        map((modal) => modal.isOpen)
    );
    context$ = this.openMoveSelectedInventoryModal$.pipe(
        map((modal) => modal.context)
    );
    submitStatus$ = new BehaviorSubject<{ update: UIStatus }>({
        update: 'idle',
    });
    private destroyed$ = new Subject<void>();

    async ngOnInit() {
        this.isOpen$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            this.submitStatus$.next({
                update: 'idle',
            });
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.uiState.closeMoveSelectedInventory();
    }

    onUpdateInventory(tour: CalendarTour, proposedDateTime: Date): void {
        this.submitStatus$.next({
            ...this.submitStatus$.getValue(),
            update: 'loading',
        });
        this.updateUnallocatedInventory(tour, proposedDateTime)
            .then(() => {
                this.submitStatus$.next({
                    ...this.submitStatus$.getValue(),
                    update: 'idle',
                });
                this.close();
            })
            .catch(() => {
                this.submitStatus$.next({
                    ...this.submitStatus$.getValue(),
                    update: 'idle',
                });
            });
    }

    private updateUnallocatedInventory(
        tour: CalendarTour,
        proposedDateTime: Date
    ): Promise<void> {
        return this.quickActionsState.editUnallocatedInventory({
            unallocatedTourInventoryId: tour.unallocatedTourInventoryId,
            tourId: tour.tourId,
            seats: tour.extras?.seatsAllocated ?? 0,
            time: proposedDateTime,
        });
    }
}
