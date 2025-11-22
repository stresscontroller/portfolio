import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
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
    startWith,
    tap,
    switchMap,
    combineLatest,
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DividerModule } from 'primeng/divider';
import { InputTextareaModule } from 'primeng/inputtextarea';

import {
    AdminTourInventory,
    Features,
    OperatorFiltersState,
    OTCBookingItem,
    sortBookingByPickupLocationAndShipName,
    UIStatus,
} from '@app/core';
import { TourInventoryState, UIState } from '../../../state';
import { ShipInPort } from '../../../state/tour-inventory.state';
import { BookingListComponent } from './booking-list/booking-list.component';
import { PermissionDirective } from '@app/shared';

type View = 'default' | 'bookings';
@Component({
    standalone: true,
    selector: 'app-edit-selected-released-inventory-modal',
    templateUrl: './edit-selected-released-inventory.component.html',
    styleUrls: ['./edit-selected-released-inventory.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputNumberModule,
        CalendarModule,
        InputTextareaModule,
        DropdownModule,
        BookingListComponent,
        PermissionDirective,
    ],
})
export class EditSelectedReleasedInventoryModalComponent {
    uiState = inject(UIState);
    tourInventoryState = inject(TourInventoryState);
    operatorFiltersState = inject(OperatorFiltersState);
    editSelectedReleasedInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editSelectedReleasedInventory),
        distinctUntilChanged()
    );
    isOpen$ = this.editSelectedReleasedInventoryModal$.pipe(
        map((modal) => modal.isOpen)
    );
    tour$ = this.editSelectedReleasedInventoryModal$.pipe(
        map((modal) =>
            modal.context
                ? {
                      ...modal.context,
                      percentageSold:
                          (modal.context.capacity &&
                              Math.floor(modal.context.capacity)) ||
                          0,
                  }
                : undefined
        )
    );
    status$ = new BehaviorSubject<{
        saveTourInventory: UIStatus;
        loadBookings: UIStatus;
    }>({
        saveTourInventory: 'idle',
        loadBookings: 'idle',
    });
    loadingShipsInPort$ = new BehaviorSubject<boolean>(false);
    bookings$ = new BehaviorSubject<OTCBookingItem[]>([]);
    view$ = new BehaviorSubject<View>('default');

    editTourInventoryForm = new FormGroup({
        capacity: new FormControl<number | null>(null, {
            validators: Validators.required,
        }),
        tourDate: new FormControl<Date | null>(null, {
            validators: Validators.required,
        }),
        tourTime: new FormControl<Date | null>(null, {
            validators: Validators.required,
        }),
        cruiseLine: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        shipId: new FormControl<number | null>(null, {
            validators: Validators.required,
        }),
        specialNotes: new FormControl<string | null>(null),
    });
    agentUsers$ = this.operatorFiltersState.agentUsers$;
    defaultTime: Date = new Date();
    features = Features;

    shipsInPort$ = new BehaviorSubject<ShipInPort[]>([]);
    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.operatorFiltersState.getAgentUsers();
        this.tour$
            .pipe(
                takeUntil(this.destroyed$),
                tap((tour) => {
                    this.editTourInventoryForm.reset();
                    if (tour) {
                        let startTime = '';
                        try {
                            startTime = `${
                                tour.tourInventoryDate.split('T')[0]
                            }T${tour.tourInventoryTime}`;
                        } catch (e) {
                            // prevent error
                        }
                        const tourDateTime = startTime
                            ? new Date(startTime)
                            : new Date();
                        this.defaultTime = new Date(startTime);
                        this.editTourInventoryForm.patchValue({
                            capacity: tour.tourInventoryAllocatedSeats,
                            tourDate: tourDateTime,
                            tourTime: tourDateTime,
                            shipId: tour.shipId === null ? -1 : tour.shipId,
                        });

                        this.loadBookings(tour.tourInventoryID);
                    } else {
                        this.defaultTime = new Date();
                    }
                }),
                switchMap((tour) => {
                    return this.editTourInventoryForm.controls.tourDate.valueChanges.pipe(
                        startWith(this.editTourInventoryForm.value.tourDate),
                        tap((tourDate) => {
                            if (tour && tourDate) {
                                this.shipsInPort$.next([]);
                                this.loadingShipsInPort$.next(true);
                                this.tourInventoryState
                                    .loadSingleCruiseSchedule(
                                        new Date(tourDate),
                                        tour.tourInventoryID
                                    )
                                    .then((shipDetails) => {
                                        this.editTourInventoryForm.patchValue({
                                            specialNotes:
                                                shipDetails.specialNotes,
                                        });
                                        this.shipsInPort$.next(
                                            shipDetails.ships
                                        );
                                        this.loadingShipsInPort$.next(false);
                                        const formValues =
                                            this.editTourInventoryForm.getRawValue();
                                        if (
                                            shipDetails.ships.findIndex(
                                                (shipInPort) =>
                                                    shipInPort.shipId ===
                                                    formValues.shipId
                                            ) === -1
                                        ) {
                                            this.editTourInventoryForm.controls.shipId.reset();
                                            this.editTourInventoryForm.controls.cruiseLine.reset();
                                            this.editTourInventoryForm.updateValueAndValidity();
                                        }
                                    });
                            }
                        })
                    );
                })
            )
            .subscribe();
        combineLatest([
            this.editTourInventoryForm.controls.shipId.valueChanges.pipe(
                startWith(null)
            ),
            this.shipsInPort$,
        ])
            .pipe(takeUntil(this.destroyed$))
            .subscribe(([shipId, shipsInPort]) => {
                if (shipId && shipsInPort) {
                    this.editTourInventoryForm.controls.cruiseLine.patchValue(
                        shipsInPort.find((cruise) => cruise.shipId === shipId)
                            ?.shipCompanyId || null,
                        { emitEvent: false }
                    );
                } else {
                    this.editTourInventoryForm.controls.cruiseLine.patchValue(
                        null,
                        {
                            emitEvent: false,
                        }
                    );
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    saveTourInventory(tourInventory: AdminTourInventory): void {
        if (this.editTourInventoryForm.invalid) {
            Object.values(this.editTourInventoryForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next({
            ...this.status$.getValue(),
            saveTourInventory: 'loading',
        });
        const formValues = this.editTourInventoryForm.getRawValue();
        this.tourInventoryState
            .updateTourInventory({
                tourInventoryId: tourInventory.tourInventoryID,
                tourId: tourInventory.tourID,
                shipCompanyId: formValues.cruiseLine || null,
                shipId: formValues.shipId === -1 ? null : formValues.shipId,
                tourInventoryDate: formValues.tourDate
                    ? formatDate(formValues.tourDate, 'yyyy-MM-dd', 'en-US')
                    : '', // "2024-07-25",
                tourInventoryTime: formValues.tourTime
                    ? formatDate(formValues.tourTime, 'HH:mm:00', 'en-US')
                    : '', //"10:00:00",
                tourInventoryAllocatedSeats: formValues.capacity || 0,
                partnerId: null,
                specialNotes: formValues.specialNotes ?? '',
                companyUniqueID: '',
                createdBy: '',
            })
            .then(() => {
                this.close();
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    saveTourInventory: 'error',
                });
            });
    }

    close(): void {
        this.status$.next({
            saveTourInventory: 'idle',
            loadBookings: 'idle',
        });
        this.setView('default');
        this.uiState.closeEditSelectedReleasedInventoryModal();
    }

    setView(view: View): void {
        this.view$.next(view);
    }

    focusFromTime(): void {
        // workaround to automatically set the fromtime to the defaulted time value
        // as there is now ay to select the default time without:
        // - typing it out
        // - go to a different time and go back
        if (!this.editTourInventoryForm.controls.tourTime.getRawValue()) {
            this.editTourInventoryForm.controls.tourTime.setValue(
                this.defaultTime
            );
        }
    }

    private loadBookings(tourInventoryId: number): void {
        this.bookings$.next([]);
        this.status$.next({
            ...this.status$.getValue(),
            loadBookings: 'loading',
        });
        this.tourInventoryState
            .loadAssignmentBookingList(tourInventoryId)
            .then((bookings) => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadBookings: 'success',
                });
                this.bookings$.next(
                    sortBookingByPickupLocationAndShipName(bookings)
                );
            })
            .catch(() => {
                // error
                this.status$.next({
                    ...this.status$.getValue(),
                    loadBookings: 'error',
                });
            });
    }
}
