import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AdminTourInventory } from '@app/core';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        editSelectedReleasedInventory: {
            isOpen: boolean;
            context?: AdminTourInventory;
        };
        deleteSelectedReleasedInventory: {
            isOpen: boolean;
            context?: AdminTourInventory;
        };
    }>({
        editSelectedReleasedInventory: {
            isOpen: false,
        },
        deleteSelectedReleasedInventory: {
            isOpen: false,
        },
    });

    openEditSelectedReleasedInventoryModal(context: AdminTourInventory): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            editSelectedReleasedInventory: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditSelectedReleasedInventoryModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            editSelectedReleasedInventory: {
                isOpen: false,
            },
        });
    }

    openDeleteSelectedReleasedInventoryModal(
        context: AdminTourInventory
    ): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            deleteSelectedReleasedInventory: {
                isOpen: true,
                context,
            },
        });
    }

    closeDeleteSelectedReleasedInventoryModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            deleteSelectedReleasedInventory: {
                isOpen: false,
            },
        });
    }
}
