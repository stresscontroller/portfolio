import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    Subject,
    distinctUntilChanged,
    map,
    BehaviorSubject,
    takeUntil,
    combineLatest,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CalendarTour } from '@app/shared';
import { UIState } from '../../../state';
import { QuickActionsState } from '../../../state';

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
    selector: 'app-edit-selected-allocated-inventory-modal',
    templateUrl: './edit-selected-allocated-inventory.component.html',
    styleUrls: ['./edit-selected-allocated-inventory.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DropdownModule,
    ],
})
export class EditSelectedAllocatedInventoryModalComponent {
    uiState = inject(UIState);
    quickActionsState = inject(QuickActionsState);
    editAllocatedSelectedInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editAllocatedSelectedInventory),
        distinctUntilChanged()
    );
    isOpen$ = this.editAllocatedSelectedInventoryModal$.pipe(
        map((modal) => modal.isOpen)
    );
    tour$ = this.editAllocatedSelectedInventoryModal$.pipe(
        map((data) => data.context?.tour)
    );
    ships$ = this.editAllocatedSelectedInventoryModal$.pipe(
        map((data) => data.context?.ships)
    );
    submitStatus$ = new BehaviorSubject<{ update: Status }>({
        update: 'idle',
    });

    allocateInventoryForm = new FormGroup({
        ship: new FormControl<ShipOption | null>(null, [Validators.required]),
    });

    shipOptions$ = combineLatest([this.ships$, this.tour$]).pipe(
        map(([ships, tour]) => {
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
        this.uiState.closeEditSelectedInventory();
    }

    onUpdateInventory(tour: CalendarTour): void {
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

    private updateAllocatedInventory(tour: CalendarTour): Promise<void> {
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

        return this.quickActionsState.editAllocatedInventory(
            tour,
            formValues.ship?.shipId === -2 ? null : formValues.ship.shipId,
            formValues.ship?.shipCompanyId === -2
                ? null
                : formValues.ship.shipCompanyId
        );
    }
}
