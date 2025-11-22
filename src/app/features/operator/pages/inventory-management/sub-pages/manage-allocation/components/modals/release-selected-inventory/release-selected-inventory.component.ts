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
import { UIStatus } from '@app/core';
import { CalendarTour } from '@app/shared';
import { UIState, QuickActionsState } from '../../../state';
import { InventoryManagementState } from '../../../../state';

@Component({
    standalone: true,
    selector: 'app-release-selected-inventory-modal',
    templateUrl: './release-selected-inventory.component.html',
    styleUrls: ['./release-selected-inventory.component.scss'],
    imports: [CommonModule, DialogModule, ButtonModule],
})
export class ReleaseSelectedInventoryModalComponent {
    uiState = inject(UIState);
    quickActionsState = inject(QuickActionsState);
    inventoryManagementState = inject(InventoryManagementState);

    releaseSelectedInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.releaseSelectedInventory),
        distinctUntilChanged()
    );
    isOpen$ = this.releaseSelectedInventoryModal$.pipe(
        map((modal) => modal.isOpen)
    );
    tour$ = this.releaseSelectedInventoryModal$.pipe(
        map((data) => data.context)
    );
    submitStatus$ = new BehaviorSubject<UIStatus>('idle');

    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.isOpen$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            this.submitStatus$.next('idle');
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    releaseInventory(tour: CalendarTour): void {
        this.submitStatus$.next('loading');
        this.quickActionsState
            .releaseInventory(tour)
            .then(() => {
                this.inventoryManagementState.refresh();
                this.submitStatus$.next('idle');
                this.close();
            })
            .catch(() => {
                this.submitStatus$.next('error');
            });
    }

    close(): void {
        this.uiState.closeReleaseSelectedInventory();
    }
}
