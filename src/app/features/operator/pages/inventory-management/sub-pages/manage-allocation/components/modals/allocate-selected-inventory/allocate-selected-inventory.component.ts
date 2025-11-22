import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { UIState } from '../../../state';
import {
    Subject,
    distinctUntilChanged,
    map,
    BehaviorSubject,
    takeUntil,
    combineLatest,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CalendarTour, PermissionDirective } from '@app/shared';
import { QuickActionsState } from '../../../state';
import { DropdownModule } from 'primeng/dropdown';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { InventoryManagementState } from '../../../../state';
import { Features } from '@app/core';

type Status = 'idle' | 'loading' | 'success' | 'error';
type ShipOption = {
    label: string;
    shipId: number;
    shipCompanyId: number;
};
@Component({
    standalone: true,
    selector: 'app-allocate-selected-inventory-modal',
    templateUrl: './allocate-selected-inventory.component.html',
    styleUrls: ['./allocate-selected-inventory.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DropdownModule,
        PermissionDirective,
    ],
})
export class AllocateSelectedInventoryModalComponent {
    uiState = inject(UIState);
    quickActionsState = inject(QuickActionsState);
    inventoryManagementState = inject(InventoryManagementState);
    features = Features;

    allocateSelectedInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.allocateSelectedInventory),
        distinctUntilChanged()
    );
    isOpen$ = this.allocateSelectedInventoryModal$.pipe(
        map((modal) => modal.isOpen)
    );
    tour$ = this.allocateSelectedInventoryModal$.pipe(
        map((data) => data.context?.tour)
    );
    ships$ = this.allocateSelectedInventoryModal$.pipe(
        map((data) => data.context?.ships)
    );
    submitStatus$ = new BehaviorSubject<{ allocate: Status; release: Status }>({
        allocate: 'idle',
        release: 'idle',
    });

    allocateInventoryForm = new FormGroup({
        ship: new FormControl<ShipOption | null>(null, [Validators.required]),
    });

    shipOptions$ = combineLatest([this.ships$, this.tour$]).pipe(
        map(([ships, tour]) => {
            // we need to send -1 for shipCompanyId and shipId for book directs instead of 0, but we're using shipCompanyId 0 for other filters
            let options: ShipOption[] = [
                {
                    label: 'Book Direct',
                    shipCompanyId: -1,
                    shipId: -1,
                },
            ];
            if (ships && ships.length > 0 && tour?.portId) {
                const shipsInPort = ships?.filter(
                    (ship) => ship.portId === tour?.portId
                );
                options = [
                    ...options,
                    ...shipsInPort
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
        this.uiState.closeAllocateSelectedInventory();
    }

    onAllocateInventory(tour: CalendarTour): void {
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

    onReleaseInventory(tour: CalendarTour): void {
        this.submitStatus$.next({
            ...this.submitStatus$.getValue(),
            release: 'loading',
        });
        this.allocateAndReleaseInventory(tour)
            .then(() => {
                this.inventoryManagementState.refresh();
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

    private allocateInventory(tour: CalendarTour): Promise<void> {
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

        return this.quickActionsState.allocateInventory(
            tour,
            formValues.ship?.shipId,
            formValues.ship?.shipCompanyId
        );
    }

    private allocateAndReleaseInventory(tour: CalendarTour): Promise<void> {
        return this.allocateInventory(tour).then(() => {
            return this.quickActionsState.releaseInventory(tour);
        });
    }
}
