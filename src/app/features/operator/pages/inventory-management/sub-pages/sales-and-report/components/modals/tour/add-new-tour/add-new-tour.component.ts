import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SalesReportState, UIState } from '../../../../state';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { OperatorFiltersState, UIStatus, UserState } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-add-new-tour',
    templateUrl: './add-new-tour.component.html',
    styleUrls: ['./add-new-tour.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        DropdownModule,
        InputTextModule,
    ],
})
export class AddNewTourComponent {
    userState = inject(UserState);
    uiState = inject(UIState);
    operatorFiltersState = inject(OperatorFiltersState);
    salesReportState = inject(SalesReportState);
    addNewTourModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewTour),
        distinctUntilChanged()
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    isOpen$ = this.addNewTourModal$.pipe(map((modal) => modal.isOpen));

    addNewTourForm = new FormGroup({
        cruiseLine: new FormControl<number | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        tour: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        cruiseLineTourName: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        cruiseLineTourCode: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
    });

    cruiseLines$ = this.operatorFiltersState.cruiseLines$;

    tours$ = this.operatorFiltersState.tours$;

    close(): void {
        this.uiState.closeAddNewTourModal();
    }

    save(): void {
        if (this.addNewTourForm.invalid) {
            Object.values(this.addNewTourForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        this.status$.next('loading');
        const formValues = this.addNewTourForm.getRawValue();
        this.salesReportState
            .updateInsertShipCompanyTourMap({
                shipCompanyTourMapsId: 0,
                tourName: formValues.tour || '',
                tourId: 0,
                cruiseLineTourCode: formValues.cruiseLineTourCode || '',
                cruiseLineTourName: formValues.cruiseLineTourName || '',
                companyUniqueID:
                    this.userState.aspNetUser$.getValue()?.companyUniqueID ||
                    '',
                shipCompanyId: formValues.cruiseLine || 0,
            })
            .then(() => {
                this.status$.next('idle');
                this.close();
                this.salesReportState.refresh();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
