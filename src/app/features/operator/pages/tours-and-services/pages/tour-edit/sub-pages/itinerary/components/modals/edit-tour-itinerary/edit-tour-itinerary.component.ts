import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    AbstractControl,
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

import { UIState, TourItineraryState } from '../../../state';

interface orderOption {
    label: string;
    value: number;
}

@Component({
    standalone: true,
    selector: 'app-edit-tour-itinerary-modal',
    templateUrl: './edit-tour-itinerary.component.html',
    styleUrls: ['./edit-tour-itinerary.component.scss'],
    imports: [
        ReactiveFormsModule,
        DialogModule,
        CommonModule,
        DividerModule,
        DropdownModule,
        ButtonModule,
        InputTextModule,
        InputGroupModule,
        InputTextareaModule,
        InputGroupAddonModule,
        InputIconModule,
        IconFieldModule,
    ],
})
export class EditTourItineraryModalComponent {
    uiState = inject(UIState);
    tourItineraryState = inject(TourItineraryState);

    editTourItinerary$ = this.uiState.modals$.pipe(
        map((modals) => modals.editTourItinerary),
        distinctUntilChanged()
    );
    isOpen$ = this.editTourItinerary$.pipe(map((modal) => modal.isOpen));
    context$ = this.editTourItinerary$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    editTourItineraryForm = new FormGroup(
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
    private editTourItineraryId: number | undefined = undefined;
    private editItineraryOrderNo: number | undefined = undefined;
    private destroyed$ = new Subject<void>();

    tourItinerary$ = this.editTourItinerary$.pipe(map((data) => data.context));
    tourItineraryList: TourItinerary[] = [];
    orderOptions$ = new BehaviorSubject<orderOption[]>([]);

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
                    this.orderOptions$.next(
                        tourDetails.tourItineraryList.map((_tour, i) => {
                            return {
                                label: (i + 1).toString(),
                                value: i,
                            };
                        })
                    );
                }
            });
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeEditTourItineraryModal();
    }

    clear(): void {
        this.editTourItineraryForm.reset();
    }

    private setupForm(): void {
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return combineLatest([
                        this.tourItinerary$.pipe(
                            distinctUntilChanged((prev, curr) => {
                                return (
                                    JSON.stringify(prev) ===
                                    JSON.stringify(curr)
                                );
                            })
                        ),
                        this.tourItinerary$,
                    ]);
                })
            )
            .subscribe(([tourItinerary]) => {
                if (tourItinerary) {
                    const { hours, minutes } = this.parseTimeString(
                        tourItinerary.time
                    );
                    this.editTourItineraryId = tourItinerary.tourItineraryId;
                    this.editItineraryOrderNo = tourItinerary.orderNo;
                    this.editTourItineraryForm.patchValue({
                        description: tourItinerary.description,
                        transportation: tourItinerary.transportationType,
                        hours: hours,
                        minutes: minutes,
                        stepOrder: tourItinerary.orderNo - 1,
                    });
                }
            });
    }

    editTourItinerary() {
        if (this.editTourItineraryForm.invalid) {
            Object.values(this.editTourItineraryForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }

        const formValues = this.editTourItineraryForm.getRawValue();

        if (this.editItineraryOrderNo && formValues.stepOrder) {
            this.tourItineraryList = this.moveArrayElement(
                this.tourItineraryList,
                this.editItineraryOrderNo - 1,
                formValues.stepOrder
            );
        }
        this.saveTourItinerary();
    }

    moveArrayElement(
        array: TourItinerary[],
        fromIndex: number,
        toIndex: number
    ): TourItinerary[] {
        const element = array.splice(fromIndex, 1)[0];
        array.splice(toIndex, 0, element);
        return array;
    }

    saveTourItinerary(): void {
        const formValues = this.editTourItineraryForm.getRawValue();
        const time = `${
            formValues.hours ? this.padZero(formValues.hours) : '00'
        }:${formValues.minutes ? this.padZero(formValues.minutes) : '00'}:00`;
        const index = this.tourItineraryList.findIndex(
            (item) => item.tourItineraryId === this.editTourItineraryId
        );
        if (index !== -1) {
            this.tourItineraryList[index].description =
                formValues.description ?? '';
            this.tourItineraryList[index].time = time;
            this.tourItineraryList[index].transportationType =
                formValues.transportation ?? '';
        }
        const rowData = this.tourItineraryList;
        const changedData: TourServiceItineraryListItems[] = [];
        const tourId = this.tourItineraryState.tourId$.getValue();

        if (!tourId) {
            this.status$.next('error');
            return;
        }
        this.status$.next('loading');
        rowData.map((row, index) => {
            changedData.push({
                tourItineraryId: row.tourItineraryId,
                tourId: tourId,
                description: row.description,
                transportationType: row.transportationType,
                time: row.time,
                orderNo: index + 1,
            });
        });
        this.tourItineraryState
            .saveTourItineraryList(changedData)
            .then(() => {
                this.close();
                this.clear();
                this.tourItineraryState.refresh();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    private padZero(value: number): string {
        return value.toString().padStart(2, '0');
    }

    private parseTimeString(time: string): { hours: number; minutes: number } {
        const standardTimePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
        const timePattern = /(\d+)\s*(hour|hours|minute|minutes|min|h|m)/gi;

        let hours = 0;
        let minutes = 0;
        let match;

        if ((match = standardTimePattern.exec(time)) !== null) {
            hours = parseInt(match[1], 10);
            minutes = parseInt(match[2], 10);
        } else {
            const matches = time.match(timePattern);
            if (matches) {
                matches.forEach((m) => {
                    const parts =
                        /(\d+)\s*(hour|hours|minute|minutes|min|h|m)/i.exec(m);
                    if (parts) {
                        const value = parseInt(parts[1], 10);
                        const unit = parts[2].toLowerCase();

                        if (unit.startsWith('hour') || unit === 'h') {
                            hours += value;
                        } else if (
                            unit.startsWith('minute') ||
                            unit === 'min' ||
                            unit === 'm'
                        ) {
                            minutes += value;
                        }
                    }
                });
            }

            hours += Math.floor(minutes / 60);
            minutes = minutes % 60;
        }

        if (time.toLowerCase().match(/hour\s+minutes\s+\d+/i)) {
            const extraMinutesMatch = time.match(/hour\s+minutes\s+(\d+)/i);
            if (extraMinutesMatch) {
                minutes += parseInt(extraMinutesMatch[1], 10);
                hours += Math.floor(minutes / 60);
                minutes = minutes % 60;
            }
        }

        return { hours, minutes };
    }
}
