import { CommonModule, formatDate } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
    ReactiveFormsModule,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    map,
    Subject,
    takeUntil,
} from 'rxjs';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { OperatorFiltersState, UIStatus } from '@app/core';
import { EditInventoryState } from '../edit-inventory.state';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    standalone: true,
    selector: 'app-inventory-update',
    templateUrl: './inventory-update.component.html',
    styleUrls: ['./inventory-update.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        DividerModule,
        InputNumberModule,
        DropdownModule,
        CalendarModule,
    ],
})
export class InventoryUpdateComponent {
    @Output() back = new EventEmitter<void>();
    @Output() closeModal = new EventEmitter<void>();

    operatorFiltersState = inject(OperatorFiltersState);
    editInventoryState = inject(EditInventoryState);
    status$ = new BehaviorSubject<UIStatus>('idle');
    defaultTime = new Date(new Date().setHours(8, 0, 0, 0));
    tours$ = this.operatorFiltersState.tours$;
    tourDetails$ = combineLatest([
        this.editInventoryState.searchParams$,
        this.editInventoryState.selectedInventories$,
        this.tours$,
    ]).pipe(
        map(([searchParams, selectedInventories, tours]) => {
            return {
                tourId: searchParams?.tourId,
                tourName: tours?.find(
                    (tour) => tour.tourId === searchParams?.tourId
                )?.tourName,
                selectedInventoriesCount: selectedInventories?.length,
            };
        })
    );

    editInventoryForm = new FormGroup({
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

    ngOnInit(): void {
        this.operatorFiltersState.getTours();
        this.tourDetails$
            .pipe(distinctUntilChanged(), takeUntil(this.destroyed$))
            .subscribe((tourDetails) => {
                if (tourDetails?.tourId) {
                    this.editInventoryForm.patchValue({
                        tour: tourDetails.tourId,
                    });
                }
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
        if (!this.editInventoryForm.controls.fromTime.getRawValue()) {
            this.editInventoryForm.controls.fromTime.setValue(this.defaultTime);
        }
    }

    onBack(): void {
        this.status$.next('idle');
        this.back.emit();
    }

    onClose(): void {
        this.status$.next('idle');
        this.closeModal.emit();
    }

    updateTour(): void {
        if (this.editInventoryForm.invalid) {
            Object.values(this.editInventoryForm.controls).forEach(
                (control) => {
                    control.markAsTouched();
                    control.markAsDirty();
                }
            );
            return;
        }
        const selectedInventories =
            this.editInventoryState.selectedInventories$.getValue();
        if (!selectedInventories) {
            this.status$.next('error');
            return;
        }
        this.status$.next('loading');
        const formValues = this.editInventoryForm.getRawValue();
        this.editInventoryState
            .updateInventories({
                ids: selectedInventories.join(','),
                maxCapacity: formValues.seats || 0,
                toTime:
                    (formValues.fromTime &&
                        formatDate(formValues.fromTime, 'HH:mm', 'en-US')) ||
                    '',
                tourId: formValues.tour || 0,
            })
            .then(() => {
                this.onClose();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
