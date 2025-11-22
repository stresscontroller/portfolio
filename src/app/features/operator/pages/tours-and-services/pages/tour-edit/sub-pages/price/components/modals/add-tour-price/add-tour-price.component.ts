import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { UIState, TourPriceState } from '../../../state';
import { map, distinctUntilChanged, BehaviorSubject } from 'rxjs';
import { CommonModule, formatDate } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { UIStatus } from '@app/core';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    standalone: true,
    selector: 'app-add-new-tour-price-modal',
    templateUrl: './add-tour-price.component.html',
    styleUrls: ['./add-tour-price.component.scss'],
    imports: [
        ReactiveFormsModule,
        DialogModule,
        CommonModule,
        DividerModule,
        ButtonModule,
        CalendarModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
    ],
})
export class AddNewTourPriceModalComponent {
    uiState = inject(UIState);
    tourPriceState = inject(TourPriceState);
    addNewTourPriceModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewTourPrice),
        distinctUntilChanged()
    );

    isOpen$ = this.addNewTourPriceModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.addNewTourPriceModal$.pipe(map((modal) => modal.context));
    status$ = new BehaviorSubject<UIStatus>('idle');
    addNewTourPriceForm = new FormGroup({
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

    close(): void {
        this.status$.next('idle');
        this.addNewTourPriceForm.reset();
        this.uiState.closeAddNewTourPriceModal();
    }

    addNewTourPrice(tourId?: number): void {
        if (!tourId) {
            return;
        }
        if (this.addNewTourPriceForm.invalid) {
            Object.values(this.addNewTourPriceForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.addNewTourPriceForm.value;
        this.status$.next('loading');
        this.tourPriceState
            .saveTourPrice({
                id: 0,
                tourId: tourId,
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
                this.addNewTourPriceForm.reset();
                this.tourPriceState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
