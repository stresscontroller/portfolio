import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    AbstractControl,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { UIState, TourItineraryState } from '../../../state';
import {
    map,
    distinctUntilChanged,
    BehaviorSubject,
    Subject,
    takeUntil,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import {
    TourItinerary,
    TourServiceItineraryListItems,
    UIStatus,
} from '@app/core';

interface OrderOption {
    label: string;
    value: number;
}

@Component({
    standalone: true,
    selector: 'app-add-new-tour-itinerary-modal',
    templateUrl: './add-tour-itinerary.component.html',
    styleUrls: ['./add-tour-itinerary.component.scss'],
    imports: [
        ReactiveFormsModule,
        DialogModule,
        CommonModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
        InputTextareaModule,
        InputIconModule,
        IconFieldModule,
        InputGroupModule,
        DropdownModule,
        InputGroupAddonModule,
    ],
})
export class AddNewTourItineraryModalComponent {
    uiState = inject(UIState);
    tourItineraryState = inject(TourItineraryState);
    addNewTourItinerary$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewTourItinerary),
        distinctUntilChanged()
    );
    isOpen$ = this.addNewTourItinerary$.pipe(map((modal) => modal.isOpen));

    status$ = new BehaviorSubject<UIStatus>('idle');
    addNewTourItineraryForm = new FormGroup(
        {
            description: new FormControl<string | null>(null, {
                validators: [Validators.required],
                nonNullable: true,
            }),
            hours: new FormControl<number | null>(null, [
                Validators.min(0),
                Validators.max(23),
            ]),
            minutes: new FormControl<number | null>(null, [
                Validators.min(0),
                Validators.max(59),
            ]),
            transportation: new FormControl<string | null>(null, {
                validators: [Validators.required],
                nonNullable: true,
            }),
            stepOrder: new FormControl<number | null>(null),
        },
        {
            validators: this.atLeastOneValidator,
        }
    );
    private destroyed$ = new Subject<void>();

    tourItineraryList: TourItinerary[] = [];
    orderOptions$ = new BehaviorSubject<OrderOption[]>([]);

    atLeastOneValidator(
        formGroup: AbstractControl
    ): { [key: string]: boolean } | null {
        const hours = formGroup.get('hours')?.value;
        const minutes = formGroup.get('minutes')?.value;
        if (hours || minutes) {
            return null;
        }
        return { atLeastOneRequired: true };
    }

    ngOnInit(): void {
        this.tourItineraryState.tourDetails$
            .pipe(takeUntil(this.destroyed$))
            .subscribe((tourDetails) => {
                if (tourDetails) {
                    this.tourItineraryList =
                        tourDetails.tourItineraryList || [];
                    const orderOptions = [
                        {
                            label: 'Next step',
                            value: tourDetails.tourItineraryList.length + 1,
                        },
                        ...tourDetails.tourItineraryList.map((_tour, i) => ({
                            label: (i + 1).toString(),
                            value: i + 1,
                        })),
                    ];
                    this.addNewTourItineraryForm
                        .get('stepOrder')
                        ?.setValue(orderOptions[0].value);
                    this.orderOptions$.next(orderOptions);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    addNewTourItinerary(): void {
        if (this.addNewTourItineraryForm.invalid) {
            Object.values(this.addNewTourItineraryForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.addNewTourItineraryForm.value;
        const time = `${
            formValues.hours ? this.padZero(formValues.hours) : '00'
        }:${formValues.minutes ? this.padZero(formValues.minutes) : '00'}:00`;
        const orderNo = formValues.stepOrder ?? 0;
        const tourId = this.tourItineraryState.tourId$.getValue();
        if (!tourId) {
            this.status$.next('error');
            return;
        }

        this.status$.next('loading');
        this.tourItineraryState
            .saveTourItinerary({
                tourItineraryId: 0,
                tourId: tourId,
                description: formValues.description ?? '',
                transportationType: formValues.transportation ?? '',
                time: time,
                createdBy: '',
                orderNo: orderNo,
            })
            .then((res) => {
                const config: TourItinerary = {
                    tourItineraryId: res,
                    orderNo: orderNo,
                    description: formValues.description ?? '',
                    transportationType: formValues.transportation ?? '',
                    time: time,
                };
                this.tourItineraryList.splice(orderNo - 1, 0, config);
                return this.saveReorderedRowIndexes(
                    orderNo,
                    this.tourItineraryList.length
                );
            })
            .then(() => {
                this.status$.next('idle');
                this.clear();
                this.close();
                this.tourItineraryState.refresh();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    private saveReorderedRowIndexes(
        startIndex: number,
        endIndex: number
    ): Promise<void> {
        if (!this.tourItineraryList || this.tourItineraryList.length === 0) {
            return Promise.reject('itetour itinerary list is empty');
        }
        for (let i = startIndex; i < endIndex; i++) {
            this.tourItineraryList[i].orderNo = i + 1;
        }
        const rowData = this.tourItineraryList;
        const reOrderRows: TourServiceItineraryListItems[] = [];

        const tourId = this.tourItineraryState.tourId$.getValue();
        if (!tourId) {
            // error handling
            return Promise.reject('missing tourId');
        }
        rowData.map((row, index) => {
            reOrderRows.push({
                tourItineraryId: row.tourItineraryId,
                tourId: tourId,
                description: row.description,
                transportationType: row.transportationType,
                time: row.time,
                orderNo: index + 1,
            });
        });
        return this.tourItineraryState
            .saveTourItineraryList(reOrderRows)
            .then(() => {
                return Promise.resolve();
            });
    }

    private padZero(value: number): string {
        return value.toString().padStart(2, '0');
    }

    clear(): void {
        this.addNewTourItineraryForm.reset();
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeAddNewTourItineraryModal();
    }
}
