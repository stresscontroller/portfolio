import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import {
    BehaviorSubject,
    Subject,
    combineLatest,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
} from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CalendarModule } from 'primeng/calendar';

import { CruiseLineTourConfig, UIStatus, adjustDate } from '@app/core';
import { UIState, CruiseLinesState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-edit-cruise-line-tour-modal',
    templateUrl: './edit-cruise-line-tour.component.html',
    styleUrls: ['./edit-cruise-line-tour.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
        InputSwitchModule,
        CalendarModule,
    ],
})
export class EditCruiseLineTourModalComponent {
    uiState = inject(UIState);
    cruiseLinesState = inject(CruiseLinesState);

    editCruiseLineTour$ = this.uiState.modals$.pipe(
        map((modals) => modals.editCruiseLineTour),
        distinctUntilChanged()
    );
    isOpen$ = this.editCruiseLineTour$.pipe(map((modal) => modal.isOpen));
    context$ = this.editCruiseLineTour$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    private destroyed$ = new Subject<void>();
    private shipCompanyTourId: number = 0;
    private tourId: number = 0;
    cruiseLineDetails$ = this.cruiseLinesState.cruiseLineDetails$;

    editCruiseLineTourForm = new FormGroup({
        cruiseLineTourName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        cruiseLineTourCode: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        startDate: new FormControl<Date | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        netRateAdult: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        netRateChild: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        isOffered: new FormControl<boolean | false>(false),
    });

    ngOnInit(): void {
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeEditCruiseLineTourModal();
    }

    private setupForm(): void {
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return combineLatest([
                        this.context$.pipe(
                            distinctUntilChanged((prev, curr) => {
                                return (
                                    JSON.stringify(prev) ===
                                    JSON.stringify(curr)
                                );
                            })
                        ),
                        this.context$,
                    ]);
                })
            )
            .subscribe(([cruiseLineTour]) => {
                if (cruiseLineTour) {
                    this.shipCompanyTourId = cruiseLineTour.shipCompanyTourId;
                    this.tourId = cruiseLineTour.tourId;
                    this.editCruiseLineTourForm.patchValue({
                        ...cruiseLineTour,
                        startDate: cruiseLineTour.startDate
                            ? adjustDate(new Date(cruiseLineTour.startDate))
                            : new Date(),
                    });
                }
            });
    }

    updateLineTourCodeName(): void {
        if (this.editCruiseLineTourForm.invalid) {
            const controlsToCheck = [
                'cruiseLineTourName',
                'cruiseLineTourCode',
            ];
            controlsToCheck.forEach((controlName) => {
                const control = this.editCruiseLineTourForm.get(controlName);
                if (control?.invalid) {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            });
            return;
        }
        this.status$.next('loading');
        const formValues = this.editCruiseLineTourForm.getRawValue();
        this.cruiseLinesState
            .updateCruiseLineTourNameCode({
                shipCompanyId: this.shipCompanyTourId,
                tourId: this.tourId,
                cruiseLineTourName: formValues.cruiseLineTourName ?? '',
                cruiseLineTourCode: formValues.cruiseLineTourCode ?? '',
                companyId: '',
            })
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    save(): void {
        if (this.editCruiseLineTourForm.invalid) {
            Object.values(this.editCruiseLineTourForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.editCruiseLineTourForm.getRawValue();
        const config: CruiseLineTourConfig = {
            shipCompanyId: this.shipCompanyTourId,
            tourId: this.tourId,
            cruiseLineTourName: formValues.cruiseLineTourName ?? '',
            cruiseLineTourCode: formValues.cruiseLineTourCode ?? '',
            startDate: formValues.startDate
                ? new Date(formValues.startDate).toISOString()
                : '',
            adultRate: formValues.netRateAdult ?? 0,
            childRate: formValues.netRateChild ?? 0,
            isOffered: formValues.isOffered ?? false,
            companyId: '',
        };
        this.cruiseLinesState
            .updateCruiseLineTour(config)
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
