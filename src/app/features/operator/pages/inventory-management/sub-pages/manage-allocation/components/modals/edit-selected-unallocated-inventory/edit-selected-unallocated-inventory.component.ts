import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
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
    selector: 'app-edit-selected-unallocated-inventory-modal',
    templateUrl: './edit-selected-unallocated-inventory.component.html',
    styleUrls: ['./edit-selected-unallocated-inventory.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        CalendarModule,
        InputNumberModule,
        DropdownModule,
    ],
})
export class EditSelectedUnallocatedInventoryModalComponent {
    uiState = inject(UIState);
    quickActionsState = inject(QuickActionsState);
    operatorFiltersState = inject(OperatorFiltersState);
    editUnallocatedSelectedInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editUnallocatedSelectedInventory),
        distinctUntilChanged()
    );
    isOpen$ = this.editUnallocatedSelectedInventoryModal$.pipe(
        map((modal) => modal.isOpen)
    );
    tour$ = this.editUnallocatedSelectedInventoryModal$.pipe(
        map((data) => data.context)
    );
    submitStatus$ = new BehaviorSubject<{ update: UIStatus }>({
        update: 'idle',
    });
    tours$ = this.operatorFiltersState.tours$;

    editUnallocatedInventoryForm = new FormGroup({
        tour: new FormControl<number | null>(null, {
            validators: Validators.required,
            nonNullable: true,
        }),
        seats: new FormControl<number | null>(null, {
            validators: [Validators.required, Validators.min(1)],
            nonNullable: true,
        }),
        fromTime: new FormControl<Date | null>(null, {
            validators: Validators.required,
            nonNullable: true,
        }),
        fromDate: new FormControl<Date | null>(null, {
            validators: Validators.required,
            nonNullable: true,
        }),
    });
    private destroyed$ = new Subject<void>();

    defaultTime = new Date(new Date().setHours(8, 0, 0, 0));

    async ngOnInit() {
        await this.operatorFiltersState.getTours();
        this.tour$.pipe(takeUntil(this.destroyed$)).subscribe((tour) => {
            if (tour) {
                this.editUnallocatedInventoryForm.patchValue({
                    tour: tour.tourId,
                    seats: tour.extras?.seatsAllocated || null,
                    fromTime: tour.start,
                    fromDate: tour.start,
                });
            } else {
                this.editUnallocatedInventoryForm.reset();
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

    focusFromTime(): void {
        // workaround to automatically set the fromtime to the defaulted time value
        // as there is now ay to select the default time without:
        // - typing it out
        // - go to a different time and go back
        if (
            !this.editUnallocatedInventoryForm.controls.fromTime.getRawValue()
        ) {
            this.editUnallocatedInventoryForm.controls.fromTime.setValue(
                this.defaultTime
            );
        }
    }

    close(): void {
        this.uiState.closeEditSelectedInventory();
    }

    onUpdateInventory(tour: CalendarTour): void {
        this.submitStatus$.next({
            ...this.submitStatus$.getValue(),
            update: 'loading',
        });
        this.updateUnallocatedInventory(tour)
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

    private updateUnallocatedInventory(tour: CalendarTour): Promise<void> {
        // validate form
        if (this.editUnallocatedInventoryForm.invalid) {
            Object.values(this.editUnallocatedInventoryForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return Promise.reject('invalid form');
        }
        const formValues = this.editUnallocatedInventoryForm.getRawValue();

        const targetTime = formValues.fromDate;
        if (!targetTime || !formValues.fromTime) {
            return Promise.reject('invalidForm');
        }
        targetTime.setHours(formValues.fromTime.getHours());
        targetTime.setMinutes(formValues.fromTime.getMinutes());
        return this.quickActionsState.editUnallocatedInventory({
            unallocatedTourInventoryId: tour.unallocatedTourInventoryId,
            tourId: formValues.tour!,
            seats: formValues.seats!,
            time: targetTime!,
        });
    }
}
