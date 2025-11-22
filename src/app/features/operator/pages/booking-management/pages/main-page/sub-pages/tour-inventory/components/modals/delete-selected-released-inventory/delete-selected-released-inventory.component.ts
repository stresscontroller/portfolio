import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { distinctUntilChanged, map, BehaviorSubject } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { AdminTourInventory, UIStatus } from '@app/core';
import { TourInventoryState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-delete-selected-released-inventory-modal',
    templateUrl: './delete-selected-released-inventory.component.html',
    styleUrls: ['./delete-selected-released-inventory.component.scss'],
    imports: [CommonModule, DialogModule, ButtonModule, DividerModule],
})
export class DeleteSelectedReleasedInventoryModalComponent {
    uiState = inject(UIState);
    tourInventoryState = inject(TourInventoryState);
    deleteSelectedReleasedInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteSelectedReleasedInventory),
        distinctUntilChanged()
    );
    isOpen$ = this.deleteSelectedReleasedInventoryModal$.pipe(
        map((modal) => modal.isOpen)
    );

    tour$ = this.deleteSelectedReleasedInventoryModal$.pipe(
        map((modal) =>
            modal.context
                ? {
                      ...modal.context,
                      percentageSold:
                          (modal.context.capacity &&
                              Math.floor(modal.context.capacity)) ||
                          0,
                  }
                : undefined
        )
    );

    status$ = new BehaviorSubject<UIStatus>('idle');

    deleteTourInventory(tourInventory: AdminTourInventory): void {
        this.status$.next('loading');
        this.tourInventoryState
            .deleteTourInventory(tourInventory)
            .then(() => {
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeDeleteSelectedReleasedInventoryModal();
    }
}
