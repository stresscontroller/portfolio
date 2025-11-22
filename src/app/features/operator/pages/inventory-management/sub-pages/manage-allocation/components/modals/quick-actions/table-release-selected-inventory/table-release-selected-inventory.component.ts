import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { UIState } from '../../../../state';
import {
    Subject,
    distinctUntilChanged,
    map,
    BehaviorSubject,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { TourInventoryItem } from '@app/core';
import { QuickActionsState } from '../../../../state';
@Component({
    standalone: true,
    selector: 'app-table-release-selected-inventory-modal',
    templateUrl: './table-release-selected-inventory.component.html',
    styleUrls: ['./table-release-selected-inventory.component.scss'],
    imports: [CommonModule, DialogModule, ButtonModule],
})
export class TableReleaseSelectedInventoryModalComponent {
    uiState = inject(UIState);
    quickActionsState = inject(QuickActionsState);
    releaseSelectedInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.quickReleaseSelectedInventory),
        distinctUntilChanged()
    );
    isOpen$ = this.releaseSelectedInventoryModal$.pipe(
        map((modal) => modal.isOpen)
    );
    tour$ = this.releaseSelectedInventoryModal$.pipe(
        map((data) => data.context)
    );
    submitStatus$ = new BehaviorSubject<
        'idle' | 'loading' | 'success' | 'error'
    >('idle');

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

    releaseInventory(tour: TourInventoryItem): void {
        this.submitStatus$.next('loading');
        this.quickActionsState
            .releaseTableInventory(tour)
            .then(() => {
                this.submitStatus$.next('idle');
                this.close();
            })
            .catch(() => {
                this.submitStatus$.next('error');
            });
    }

    close(): void {
        this.uiState.closeQuickReleaseSelectedInventoryModal();
    }
}
