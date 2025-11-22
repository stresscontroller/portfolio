import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { AssignmentsState, UIState } from '../../../../state';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import {
    AgentUser,
    AppAssignment,
    Features,
    OTCBookingItem,
    OperatorFiltersState,
    TourTimes,
    UIStatus,
    UserState,
    checkPageFeatureAccess,
    UIState as CoreUIState,
    ConfirmationDialogMessages,
} from '@app/core';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import {
    BehaviorSubject,
    combineLatest,
    filter,
    from,
    map,
    Observable,
    of,
    startWith,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';
import {
    IconCruiseComponent,
    PermissionDirective,
    PhoneNumberComponent,
    TourInventoryTimePipe,
} from '@app/shared';
import { ShipInPort } from '../../../../state/assignments.state';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    standalone: true,
    selector: 'app-modal-edit-booking',
    templateUrl: './modal-edit-booking.component.html',
    styleUrls: ['./modal-edit-booking.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        SelectButtonModule,
        InputTextModule,
        InputNumberModule,
        InputTextareaModule,
        DropdownModule,
        CheckboxModule,
        PhoneNumberComponent,
        PermissionDirective,
        TourInventoryTimePipe,
        IconCruiseComponent,
        TooltipModule,
    ],
})
export class ModalEditBookingComponent {
    @Input() tourDate: Date | undefined = undefined;
    @Input() assignment: AppAssignment | undefined = undefined;
    @Input() set booking(value: OTCBookingItem | undefined) {
        this._booking = value;
        this.isOTC$.next(value?.isOTC || false);
        this.operatorFiltersState.getAgentUsers().then((agents) => {
            const agent = agents.find(
                (agent) => agent.partnerId === value?.agentId
            );

            if (value) {
                this.updateBookingForm.patchValue({
                    firstName: value.firstName,
                    lastName: value.lastName,
                    adults: value.adults,
                    children: value.children,
                    email: value.agentsGuestEmail || '',
                    agent: agent || null,
                    infants: value.infants,
                    phoneNumber: value.phoneNumber,
                    notes: value.notes,
                    cruiseLine: value.shipCompanyId,
                    shipId: value.shipId,
                    pickupLocationId: value.bookingPickUp || '',
                    isComplimentary: !!value.isComplimentary,
                    tourInventoryId: value.tourInventoryID,
                });
            }
        });
    }
    @Input() exitText: string = 'Close';
    @Output() saved = new EventEmitter<void>();
    @Output() deleted = new EventEmitter<void>();
    @Output() exit = new EventEmitter<void>();

    assignmentsState = inject(AssignmentsState);
    operatorFiltersState = inject(OperatorFiltersState);
    uiState = inject(UIState);
    coreUIState = inject(CoreUIState);
    userState = inject(UserState);
    private _booking: OTCBookingItem | undefined;
    isOTC$ = new BehaviorSubject<boolean>(false);
    tourTimes: TourTimes[] = [];
    features = Features;
    seats$ = new BehaviorSubject<{
        available: number;
        allocated: number;
        ogBookedSeats: number;
    } | null>(null);
    private selectedTourInventoryId$ = new BehaviorSubject<number | null>(null);
    totalPassengersValidator = (
        editableFieldsFormControl: AbstractControl
    ): Observable<ValidationErrors | null> => {
        return combineLatest([
            this.seats$,
            this.userState.controls$,
            this.selectedTourInventoryId$,
        ]).pipe(
            filter(([_seats, controls, _tourInventoryId]) => !!controls),
            map(([seats, controls, tourInventoryId]) => {
                const overbookAllowed = checkPageFeatureAccess(
                    controls,
                    Features.dailyTourDispatch.name,
                    Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                    Features.dailyTourDispatch.pages.dailyTourDispatch.features
                        .updateBookingAllowOverbook.name
                );
                const adults =
                    editableFieldsFormControl.parent?.get('adults')?.value;
                const children =
                    editableFieldsFormControl.parent?.get('children')?.value;
                let error = null;
                const totalParticipants = adults + children;
                if (totalParticipants <= 0) {
                    error = { totalPassengersIsZero: true };
                }
                if (
                    tourInventoryId &&
                    tourInventoryId !== this.assignment?.tourInventoryId
                ) {
                    const seatsAvailable = this.tourTimes.find(
                        (tourTime) =>
                            tourTime.tourInventoryId === tourInventoryId
                    )?.availableSeats;
                    if (seatsAvailable && totalParticipants > seatsAvailable) {
                        if (overbookAllowed) {
                            this.displayOverbookWarning$.next(true);
                        } else {
                            if (error) {
                                error = {
                                    ...error,
                                    overbooked: true,
                                };
                            } else {
                                error = {
                                    overbooked: true,
                                };
                            }
                        }
                    } else {
                        this.displayOverbookWarning$.next(false);
                    }
                } else {
                    if (seats?.available) {
                        if (
                            totalParticipants > seats.ogBookedSeats &&
                            totalParticipants - seats.ogBookedSeats >
                                seats.available
                        ) {
                            if (overbookAllowed) {
                                this.displayOverbookWarning$.next(true);
                            } else {
                                if (error) {
                                    error = {
                                        ...error,
                                        overbooked: true,
                                    };
                                } else {
                                    error = {
                                        overbooked: true,
                                    };
                                }
                            }
                        } else {
                            this.displayOverbookWarning$.next(false);
                        }
                    }
                }
                editableFieldsFormControl.parent
                    ?.get('adults')
                    ?.setErrors(error);
                editableFieldsFormControl.parent
                    ?.get('children')
                    ?.setErrors(error);

                if (
                    editableFieldsFormControl.parent?.get('tourInventoryId')
                        ?.dirty ||
                    editableFieldsFormControl.parent?.get('adults')?.dirty
                ) {
                    editableFieldsFormControl.parent
                        ?.get('children')
                        ?.markAsDirty();
                }
                if (
                    editableFieldsFormControl.parent?.get('tourInventoryId')
                        ?.dirty ||
                    editableFieldsFormControl.parent?.get('children')?.dirty
                ) {
                    editableFieldsFormControl.parent
                        ?.get('adults')
                        ?.markAsDirty();
                }
                return error;
            })
        );
    };

    updateBookingForm = new FormGroup({
        agent: new FormControl<AgentUser | null>(null),
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
        adults: new FormControl(0, [], [this.totalPassengersValidator]),
        children: new FormControl(0, [], [this.totalPassengersValidator]),
        infants: new FormControl(0),
        phoneNumber: new FormControl(''),
        email: new FormControl(''),
        cruiseLine: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        shipId: new FormControl(0),
        pickupLocationId: new FormControl<string | null>(null, [
            Validators.required,
        ]),
        notes: new FormControl(''),
        isComplimentary: new FormControl<boolean>(false),
        tourInventoryId: new FormControl<number | null>(null),
    });
    status$ = new BehaviorSubject<UIStatus>('idle');

    agentUsers$ = this.operatorFiltersState.agentUsers$;
    pickupLocations$ = this.updateBookingForm.controls.cruiseLine.valueChanges
        .pipe(startWith(null))
        .pipe(
            switchMap((cruiseLine) => {
                if (this._booking?.tourInventoryID) {
                    if (cruiseLine === null) {
                        return from(
                            this.operatorFiltersState.getPickupLocation(
                                this._booking.tourInventoryID,
                                false
                            )
                        );
                    } else {
                        return from(
                            this.operatorFiltersState.getPickupLocation(
                                this._booking?.tourInventoryID,
                                true
                            )
                        );
                    }
                }
                return of([]);
            })
        );
    shipsInPort$ = new BehaviorSubject<ShipInPort[]>([]);
    displayOverbookWarning$ = new BehaviorSubject<boolean>(false);
    private isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.operatorFiltersState.getCruiseLines();
        this.operatorFiltersState.getDocks();
        // TODO: this should happen together with the otc checks
        combineLatest([this.isOTC$, this.userState.controls$])
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe(([isOtc, featureControls]) => {
                if (
                    checkPageFeatureAccess(
                        featureControls,
                        Features.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch
                            .features.bookingUpdate.name
                    )
                ) {
                    this.setFormFieldStates({
                        isOtc,
                        disableAll: false,
                    });
                } else {
                    this.setFormFieldStates({
                        isOtc,
                        disableAll: true,
                    });
                }
            });
        this.updateBookingForm.controls.shipId.valueChanges
            .pipe(startWith(null), takeUntil(this.isDestroyed$))
            .subscribe((shipId) => {
                if (shipId) {
                    this.updateBookingForm.controls.cruiseLine.patchValue(
                        this.shipsInPort$
                            .getValue()
                            .find((cruise) => cruise.shipId === shipId)
                            ?.shipCompanyId || null,
                        { emitEvent: false }
                    );
                } else {
                    this.updateBookingForm.controls.cruiseLine.patchValue(0, {
                        emitEvent: false,
                    });
                }
            });
        this.updateBookingForm.controls.tourInventoryId.valueChanges
            .pipe(startWith(null), takeUntil(this.isDestroyed$))
            .subscribe((tourInventoryId) => {
                this.selectedTourInventoryId$.next(tourInventoryId);
            });
    }

    ngOnChanges(): void {
        this.seats$.next(null);
        this.updateBookingForm.reset();
        this.displayOverbookWarning$.next(false);
        this.shipsInPort$.next([]);
        this.selectedTourInventoryId$.next(null);
        if (this.assignment && this.tourDate) {
            this.assignmentsState
                .loadSingleCruiseSchedule(
                    this.tourDate,
                    this.assignment.tourInventoryId
                )
                .then((ships) => {
                    this.shipsInPort$.next(ships);
                });
            this.tourTimes = [];
            this.assignmentsState
                .getAlternateTourTimes(this.assignment.tourId, this.tourDate)
                .then((availableTimes) => {
                    const formattedTourTimes = availableTimes
                        .map((time) => ({
                            ...time,
                            tooltipText: time.shipId
                                ? time.cruiseShipName
                                    ? `Departure for ${time.cruiseShipName}`
                                    : 'Cruise Ship Departure'
                                : 'Book Direct Departure',
                        }))
                        .sort((a, b) => {
                            return a.tourInventoryTime.localeCompare(
                                b.tourInventoryTime
                            );
                        });

                    const cruiseDepartures = formattedTourTimes.filter(
                        (time) => time.shipId != null
                    );
                    const bookDirectDepartures = formattedTourTimes.filter(
                        (time) => time.shipId == null
                    );
                    this.tourTimes = [
                        ...bookDirectDepartures,
                        ...cruiseDepartures,
                    ];
                    const currentTour = availableTimes.find(
                        (tour) =>
                            tour.tourInventoryId ===
                            this.assignment?.tourInventoryId
                    );
                    if (currentTour) {
                        this.seats$.next({
                            available: currentTour.availableSeats,
                            allocated: currentTour.tourInventoryAllocatedSeats,
                            ogBookedSeats:
                                (this.assignment?.bookingAdults || 0) +
                                (this.assignment?.actualChildren || 0),
                        });
                    }
                });
        }
    }

    ngOnDestory(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    onExit(): void {
        this.exit.emit();
    }

    deleteBooking(): void {
        if (!this._booking || !this.assignment) {
            return;
        }
        this.uiState.openDeleteOTCBookingModal({
            booking: this._booking,
            onSuccess: () => {
                this.deleted.emit();
            },
        });
    }

    save(): void {
        if (!this._booking || !this.assignment) {
            return;
        }
        if (this.updateBookingForm.invalid) {
            Object.values(this.updateBookingForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const userInfo = this.userState.aspNetUser$.getValue();
        if (!userInfo) {
            return;
        }
        if (this.displayOverbookWarning$.getValue()) {
            this.coreUIState.openConfirmationDialog({
                title: ConfirmationDialogMessages.tourDispatch.overbook.title,
                description:
                    ConfirmationDialogMessages.tourDispatch.overbook
                        .description,
                buttons: [
                    {
                        text: ConfirmationDialogMessages.tourDispatch.overbook
                            .buttons.cancel,
                        onClick: () => {
                            // close confirmation dialog
                        },
                        isPrimary: true,
                    },
                    {
                        text: ConfirmationDialogMessages.tourDispatch.overbook
                            .buttons.continue,
                        onClick: () => {
                            this.submitBooking();
                        },
                    },
                ],
            });
        } else {
            this.submitBooking();
        }
    }

    private setFormFieldStates(config: {
        isOtc: boolean;
        disableAll: boolean;
    }) {
        if (config.disableAll) {
            this.updateBookingForm.disable();
        } else {
            if (config.isOtc) {
                // enable all fields
                this.updateBookingForm.controls.children.enable();
                this.updateBookingForm.controls.adults.enable();
                this.updateBookingForm.controls.infants.enable();
                this.updateBookingForm.controls.agent.enable();
                this.updateBookingForm.controls.firstName.enable();
                this.updateBookingForm.controls.lastName.enable();
                this.updateBookingForm.controls.isComplimentary.enable();
            } else {
                // disable some fields
                this.updateBookingForm.controls.children.disable();
                this.updateBookingForm.controls.adults.disable();
                this.updateBookingForm.controls.infants.disable();
                this.updateBookingForm.controls.agent.disable();
                this.updateBookingForm.controls.firstName.disable();
                this.updateBookingForm.controls.lastName.disable();
                this.updateBookingForm.controls.isComplimentary.disable();
            }
        }
        this.updateBookingForm.updateValueAndValidity();
    }

    private submitBooking(): void {
        if (!this._booking || !this.assignment) {
            return;
        }
        const userInfo = this.userState.aspNetUser$.getValue();
        if (!userInfo) {
            return;
        }
        this.status$.next('loading');
        const formValue = this.updateBookingForm.getRawValue();
        this.assignmentsState
            .addOtcBooking(
                {
                    bookingId: this._booking.bookingId || 0,
                    shipCompanyId: formValue.cruiseLine || 0,
                    shipId: formValue.shipId || 0,
                    pickUpLocation: formValue.pickupLocationId || '',
                    bookingFirstName: formValue.firstName || '',
                    bookingLastName: formValue.lastName || '',
                    email: this._booking.bookingEmail,
                    primaryPhoneNumber: formValue.phoneNumber || '',
                    bookingNotes: formValue.notes || '',
                    createdBy: userInfo.b2CUserId || '',
                    partnerId: +(formValue.agent?.partnerId || 0),
                    agentsGuestEmail: formValue.email || '',
                    companyUniqueID: userInfo.companyUniqueID || '',
                    tourId: this.assignment.tourId,
                    bookingDate:
                        this.assignmentsState.configs$
                            .getValue()
                            .dateSelected?.toISOString() || '',
                    bookingTime: this.assignment.tourInventoryTime,
                    tourInventoryId:
                        formValue.tourInventoryId ||
                        this.assignment.tourInventoryId,
                    adults: formValue.adults || 0,
                    children: formValue.children || 0,
                    infants: formValue.infants || 0,
                    leadFirstName: formValue.firstName || '',
                    leadLastName: formValue.lastName || '',
                    paymentType: 'InvoiceLater',
                    isOTC: true,
                    isComplimentary: formValue.isComplimentary || false,
                },
                false
            )
            .then(() => {
                this.status$.next('success');
                this.saved.emit();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
