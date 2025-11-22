import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SalesReportState, UIState } from '../../../../state';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    from,
    map,
    of,
    switchMap,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { OperatorFiltersState, UIStatus, UserState } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-edit-tour',
    templateUrl: './edit-tour.component.html',
    styleUrls: ['./edit-tour.component.scss'],
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
export class EditTourComponent {
    userState = inject(UserState);
    uiState = inject(UIState);
    salesReportState = inject(SalesReportState);
    operatorFiltersState = inject(OperatorFiltersState);
    editTourModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editTour),
        distinctUntilChanged()
    );

    isOpen$ = this.editTourModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.editTourModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    editTourForm = new FormGroup({
        cruiseLine: new FormControl<number | null>(
            {
                value: null,
                disabled: true,
            },
            {
                validators: [Validators.required],
                nonNullable: true,
            }
        ),
        tour: new FormControl<string | null>(
            {
                value: null,
                disabled: true,
            },
            {
                validators: [Validators.required],
                nonNullable: true,
            }
        ),
        cruiseLineTourName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        cruiseLineTourCode: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        shipCompanyTourMapsId: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
    });
    status$ = new BehaviorSubject<UIStatus>('idle');
    tours$ = this.operatorFiltersState.tours$;
    cruiseLines$ = this.operatorFiltersState.cruiseLines$;
    cruiseShips$ = this.editTourForm.controls.cruiseLine.valueChanges.pipe(
        switchMap((cruiseLine) => {
            if (cruiseLine == null) {
                return of([]);
            }
            const cruiseShips =
                this.operatorFiltersState.cruiseShips$.getValue();
            if (cruiseShips?.[cruiseLine]) {
                return of(cruiseShips[cruiseLine]);
            } else {
                return from(this.operatorFiltersState.getShipList(cruiseLine));
            }
        })
    );

    appliedFilters$ = this.editTourModal$.pipe(map((data) => data.context));

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.uiState.closeEditTourModal();
    }

    private async setupForm() {
        await this.operatorFiltersState.getCruiseLines();
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return this.appliedFilters$.pipe(
                        distinctUntilChanged((prev, curr) => {
                            return (
                                JSON.stringify(prev) === JSON.stringify(curr)
                            );
                        }),
                        takeUntil(this.destroyed$)
                    );
                })
            )
            .subscribe(async (appliedFilters) => {
                if (appliedFilters) {
                    // all shipCompanyIds for cruises are greater than 0
                    if (appliedFilters.shipCompanyId != null) {
                        await this.operatorFiltersState.getShipList(
                            appliedFilters.shipCompanyId
                        );
                    }

                    this.editTourForm.patchValue({
                        cruiseLine: appliedFilters.shipCompanyId || null,
                        cruiseLineTourName:
                            appliedFilters.cruiseLineTourName || '',
                        tour: appliedFilters.tourName || '',
                        cruiseLineTourCode:
                            appliedFilters.cruiseLineTourCode || '',
                        shipCompanyTourMapsId:
                            appliedFilters.shipCompanyTourMapsId,
                    });
                }
            });
    }

    save(): void {
        if (this.editTourForm.invalid) {
            Object.values(this.editTourForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.editTourForm.getRawValue(); // Fetch the selected tour object from the dropdown options
        // Fetch the selected tour object from the BehaviorSubject
        const tours = this.tours$.getValue();
        const selectedTour = tours?.find(
            (tour) => tour.tourName === formValues.tour
        );
        const tourId: number = selectedTour?.tourId || 0;
        this.status$.next('loading');

        this.salesReportState
            .updateInsertShipCompanyTourMap({
                shipCompanyTourMapsId: formValues.shipCompanyTourMapsId || 0,
                tourName: formValues.tour || '',
                tourId: tourId,
                cruiseLineTourCode: formValues.cruiseLineTourCode || '',
                cruiseLineTourName: formValues.cruiseLineTourName || '',
                companyUniqueID:
                    this.userState.aspNetUser$.getValue()?.companyUniqueID ||
                    '',
                shipCompanyId: formValues.cruiseLine || 0,
            })
            .then(() => {
                this.status$.next('idle');
                this.salesReportState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
