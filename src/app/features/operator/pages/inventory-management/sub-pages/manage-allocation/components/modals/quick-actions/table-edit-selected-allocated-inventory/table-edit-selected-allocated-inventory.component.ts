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
import { OperatorFiltersState, TourInventoryItem } from '@app/core';
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
    selector: 'app-table-edit-selected-allocated-inventory-modal',
    templateUrl: './table-edit-selected-allocated-inventory.component.html',
    styleUrls: ['./table-edit-selected-allocated-inventory.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DropdownModule,
    ],
})
export class TableEditSelectedAllocatedInventoryModalComponent {
    uiState = inject(UIState);
    quickActionsState = inject(QuickActionsState);
    operatorFiltersState = inject(OperatorFiltersState);
    manageAllocationState = inject(ManageAllocationState);

    manageAllocationInventories$ =
        this.manageAllocationState.manageAllocationInventories$;

    editAllocatedSelectedInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.quickEditAllocatedSelectedInventory),
        distinctUntilChanged()
    );
    isOpen$ = this.editAllocatedSelectedInventoryModal$.pipe(
        map((modal) => modal.isOpen)
    );
    tour$ = this.editAllocatedSelectedInventoryModal$.pipe(
        map((data) => data.context)
    );
    ships$ = this.manageAllocationState.manageAllocationInventories$.pipe(
        map((data) => data.ships)
    );

    submitStatus$ = new BehaviorSubject<{ update: Status }>({
        update: 'idle',
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
            // we need to send -1 for shipCompanyId and shipId for book directs instead of 0, but we're using shipCompanyId 0 for other filters
            let options: ShipOption[] = [
                // using -2 as a temp value to allow triggering validation when field is empty
                {
                    label: 'Unallocated',
                    shipCompanyId: -2,
                    shipId: -2,
                },
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
        combineLatest([this.tour$, this.shipOptions$])
            .pipe(takeUntil(this.destroyed$))
            .subscribe(([tour, shipOptions]) => {
                if (tour && shipOptions) {
                    this.allocateInventoryForm.patchValue({
                        ship: tour.shipId
                            ? shipOptions.find(
                                  (ship) => ship.shipId === tour.shipId
                              )
                            : null,
                    });
                } else {
                    this.allocateInventoryForm.reset();
                }
            });
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
        this.uiState.closeQuickEditSelectedInventory();
    }

    onUpdateInventory(tour: TourInventoryItem): void {
        this.submitStatus$.next({
            ...this.submitStatus$.getValue(),
            update: 'loading',
        });
        this.updateAllocatedInventory(tour)
            .then(() => {
                this.submitStatus$.next({
                    ...this.submitStatus$.getValue(),
                    update: 'idle',
                });
                this.close();
            })
            .catch((error) => {
                if (error !== 'invalid form') {
                    this.submitStatus$.next({
                        ...this.submitStatus$.getValue(),
                        update: 'error',
                    });
                } else {
                    this.submitStatus$.next({
                        ...this.submitStatus$.getValue(),
                        update: 'idle',
                    });
                }
            });
    }

    private updateAllocatedInventory(tour: TourInventoryItem): Promise<void> {
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

        return this.quickActionsState.editAllocatedTableInventory(
            tour,
            formValues.ship?.shipId === -2 ? null : formValues.ship.shipId,
            formValues.ship?.shipCompanyId === -2
                ? null
                : formValues.ship.shipCompanyId
        );
    }
}
