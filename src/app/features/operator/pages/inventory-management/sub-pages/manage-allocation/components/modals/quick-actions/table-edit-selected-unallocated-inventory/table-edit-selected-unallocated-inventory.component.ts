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
import { QuickActionsState } from '../../../../state';
import { DropdownModule } from 'primeng/dropdown';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { adjustDate, OperatorFiltersState, TourInventoryItem } from '@app/core';

type Status = 'idle' | 'loading' | 'success' | 'error';
@Component({
    standalone: true,
    selector: 'app-table-edit-selected-unallocated-inventory-modal',
    templateUrl: './table-edit-selected-unallocated-inventory.component.html',
    styleUrls: ['./table-edit-selected-unallocated-inventory.component.scss'],
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
export class TableEditSelectedUnallocatedInventoryModalComponent {
    uiState = inject(UIState);
    quickActionsState = inject(QuickActionsState);
    operatorFiltersState = inject(OperatorFiltersState);
    editUnallocatedSelectedInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.quickEditUnallocatedSelectedInventory),
        distinctUntilChanged()
    );
    isOpen$ = this.editUnallocatedSelectedInventoryModal$.pipe(
        map((modal) => modal.isOpen)
    );
    tour$ = this.editUnallocatedSelectedInventoryModal$.pipe(
        map((data) => data.context)
    );
    submitStatus$ = new BehaviorSubject<{ update: Status }>({
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
    });
    private destroyed$ = new Subject<void>();

    defaultTime = new Date(new Date().setHours(8, 0, 0, 0));

    async ngOnInit() {
        await this.operatorFiltersState.getTours();
        this.tour$.pipe(takeUntil(this.destroyed$)).subscribe((tour) => {
            if (tour) {
                this.editUnallocatedInventoryForm.patchValue({
                    tour: tour.tourID,
                    seats: tour.capacity || null,
                    fromTime: tour.start
                        ? adjustDate(new Date(tour.start))
                        : new Date(),
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
        this.uiState.closeQuickEditSelectedInventory();
    }

    onUpdateInventory(tour: TourInventoryItem): void {
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

    private updateUnallocatedInventory(tour: TourInventoryItem): Promise<void> {
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

        return this.quickActionsState.editUnallocatedTableInventory({
            unallocatedTourInventoryId: tour.unallocatedTourInventoryID,
            tourId: formValues.tour!,
            seats: formValues.seats!,
            time: formValues.fromTime!,
        });
    }
}
