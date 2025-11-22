import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ManageAllocationState, UIState } from '../../../../state';
import {
    Subject,
    distinctUntilChanged,
    map,
    BehaviorSubject,
    takeUntil,
    combineLatest,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { TourInventoryItem } from '@app/core';
import { QuickActionsState } from '../../../../state';
import { DropdownModule } from 'primeng/dropdown';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';

type Status = 'idle' | 'loading' | 'success' | 'error';
type ShipOption = {
    label: string;
    shipId: number;
    shipCompanyId: number;
};
@Component({
    standalone: true,
    selector: 'app-table-allocate-selected-inventory-modal',
    templateUrl: './table-allocate-selected-inventory.component.html',
    styleUrls: ['./table-allocate-selected-inventory.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DropdownModule,
    ],
})
export class TableAllocateSelectedInventoryModalComponent {
    uiState = inject(UIState);
    quickActionsState = inject(QuickActionsState);
    manageAllocationState = inject(ManageAllocationState);
    allocateSelectedInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.quickAllocateSelectedInventory),
        distinctUntilChanged()
    );
    isOpen$ = this.allocateSelectedInventoryModal$.pipe(
        map((modal) => modal.isOpen)
    );
    tour$ = this.allocateSelectedInventoryModal$.pipe(
        map((data) => data.context)
    );
    ships$ = this.manageAllocationState.manageAllocationInventories$.pipe(
        map((data) => data.ships)
    );
    submitStatus$ = new BehaviorSubject<{ allocate: Status; release: Status }>({
        allocate: 'idle',
        release: 'idle',
    });

    allocateInventoryForm = new FormGroup({
        ship: new FormControl<ShipOption | null>(null, [Validators.required]),
    });

    shipOptions$ = combineLatest([this.tour$, this.ships$]).pipe(
        map(([tour, ships]) => {
            if (!tour) {
                return [];
            }
            const filteredShips = ships.filter((ship) => {
                if (
                    ship.portId === tour.portId &&
                    ship.start?.split('T')?.[0] === tour.start?.split('T')?.[0]
                ) {
                    return true;
                }
                return false;
            });
            let options: ShipOption[] = [
                {
                    label: 'Book Direct',
                    shipCompanyId: -1,
                    shipId: -1,
                },
            ];
            if (filteredShips && filteredShips.length > 0) {
                options = [
                    ...options,
                    ...filteredShips
                        .filter((ship) => ship.shipCompanyId && ship.shipId)
                        .map((ship) => {
                            return {
                                label: ship.description,
                                shipCompanyId: ship.shipCompanyId!,
                                shipId: ship.shipId!,
                            };
                        }),
                ];
            }
            return options;
        })
    );

    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.isOpen$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            this.submitStatus$.next({
                allocate: 'idle',
                release: 'idle',
            });
            this.allocateInventoryForm.reset();
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.uiState.closeQuickAllocateSelectedInventoryModal();
    }

    onAllocateInventory(tour: TourInventoryItem): void {
        this.submitStatus$.next({
            ...this.submitStatus$.getValue(),
            allocate: 'loading',
        });
        this.allocateInventory(tour)
            .then(() => {
                this.submitStatus$.next({
                    ...this.submitStatus$.getValue(),
                    allocate: 'idle',
                });
                this.close();
            })
            .catch((error) => {
                if (error !== 'invalid form') {
                    this.submitStatus$.next({
                        ...this.submitStatus$.getValue(),
                        allocate: 'error',
                    });
                } else {
                    this.submitStatus$.next({
                        ...this.submitStatus$.getValue(),
                        allocate: 'idle',
                    });
                }
            });
    }

    onReleaseInventory(tour: TourInventoryItem): void {
        this.submitStatus$.next({
            ...this.submitStatus$.getValue(),
            release: 'loading',
        });
        this.allocateAndReleaseInventory(tour)
            .then(() => {
                this.submitStatus$.next({
                    ...this.submitStatus$.getValue(),
                    release: 'idle',
                });
                this.close();
            })
            .catch((error) => {
                if (error !== 'invalid form') {
                    this.submitStatus$.next({
                        ...this.submitStatus$.getValue(),
                        release: 'error',
                    });
                } else {
                    this.submitStatus$.next({
                        ...this.submitStatus$.getValue(),
                        release: 'idle',
                    });
                }
            });
    }

    private allocateInventory(tour: TourInventoryItem): Promise<void> {
        // validate form
        if (this.allocateInventoryForm.invalid) {
            Object.values(this.allocateInventoryForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return Promise.reject('invalid form');
        }
        const formValues = this.allocateInventoryForm.getRawValue();
        if (!formValues.ship) {
            return Promise.reject('invalid form');
        }

        return this.quickActionsState.allocateTableInventory(
            tour,
            formValues.ship?.shipId,
            formValues.ship?.shipCompanyId
        );
    }

    private allocateAndReleaseInventory(
        tour: TourInventoryItem
    ): Promise<void> {
        return this.allocateInventory(tour).then(() => {
            return this.quickActionsState.releaseTableInventory(tour);
        });
    }
}
