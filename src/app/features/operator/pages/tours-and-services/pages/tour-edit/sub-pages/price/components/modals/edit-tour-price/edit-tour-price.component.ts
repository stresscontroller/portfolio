import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
} from 'rxjs';
import { CommonModule, formatDate } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { TourPriceDetails, UIStatus } from '@app/core';
import { UIState, TourPriceState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-edit-tour-price-modal',
    templateUrl: './edit-tour-price.component.html',
    styleUrls: ['./edit-tour-price.component.scss'],
    imports: [
        ReactiveFormsModule,
        CommonModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
        CalendarModule,
    ],
})
export class EditTourPriceModalComponent {
    uiState = inject(UIState);
    tourPriceState = inject(TourPriceState);

    editTourPrice$ = this.uiState.modals$.pipe(
        map((modals) => modals.editTourPrice),
        distinctUntilChanged()
    );
    isOpen$ = this.editTourPrice$.pipe(map((modal) => modal.isOpen));
    context$ = this.editTourPrice$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    editTourPriceForm = new FormGroup({
        startDate: new FormControl<Date | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        adultPrice: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        childPrice: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
    });
    tourPrices$ = this.editTourPrice$.pipe(map((data) => data.context));

    private tourPriceDetails: TourPriceDetails | undefined = undefined;
    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.editTourPriceForm.reset();
        this.uiState.closeEditTourPriceModal();
    }

    updateTourPrice(): void {
        if (!this.tourPriceDetails) {
            return;
        }
        if (this.editTourPriceForm.invalid) {
            Object.values(this.editTourPriceForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.editTourPriceForm.getRawValue();
        this.tourPriceState
            .saveTourPrice({
                id: this.tourPriceDetails.id,
                tourId: this.tourPriceDetails.tourId,
                startDate: formValues.startDate
                    ? formatDate(
                          new Date(formValues.startDate),
                          'YYYY-MM-dd',
                          'en-US'
                      )
                    : '',
                adultPrice: formValues.adultPrice ?? 0,
                childPrice: formValues.childPrice ?? 0,
                createdBy: '',
            })
            .then(() => {
                this.status$.next('success');
                this.editTourPriceForm.reset();
                this.tourPriceState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    private setupForm(): void {
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return this.tourPrices$.pipe(
                        distinctUntilChanged((prev, curr) => {
                            return (
                                JSON.stringify(prev) === JSON.stringify(curr)
                            );
                        })
                    );
                })
            )
            .subscribe((tourPrice) => {
                if (tourPrice) {
                    this.tourPriceDetails = tourPrice;
                    this.editTourPriceForm.patchValue({
                        startDate: new Date(tourPrice.startDate),
                        adultPrice: tourPrice.adultPrice,
                        childPrice: tourPrice.childPrice,
                    });
                }
            });
    }
}
