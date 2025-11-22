import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import {
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    filter,
    from,
    map,
    Observable,
    of,
    startWith,
    Subject,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import {
    AgentUser,
    checkPageFeatureAccess,
    Features,
    OperatorFiltersState,
    UIStatus,
    UserState,
    UIState as CoreUIState,
    ConfirmationDialogMessages,
} from '@app/core';
import { PhoneNumberComponent, TourInventoryTimePipe } from '@app/shared';
import { AssignmentsState, AddOtcModalContext, UIState } from '../../../state';
import { ModalTourDetailsComponent } from '../common';
import { ShipInPort } from '../../../state/assignments.state';

@Component({
    standalone: true,
    selector: 'app-add-otc-modal',
    templateUrl: './add-otc.component.html',
    styleUrls: ['./add-otc.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DropdownModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        InputTextareaModule,
        CheckboxModule,
        TourInventoryTimePipe,
        PhoneNumberComponent,
        ModalTourDetailsComponent,
    ],
})
export class AddOtcModalComponent {
    assignmentState = inject(AssignmentsState);
    operatorFiltersState = inject(OperatorFiltersState);
    uiState = inject(UIState);
    coreUIState = inject(CoreUIState);
    userState = inject(UserState);

    seats$ = new BehaviorSubject<{
        available: number;
        allocated: number;
    } | null>(null);
    totalPassengersValidator = (
        editableFieldsFormControl: AbstractControl
    ): Observable<ValidationErrors | null> => {
        return combineLatest([this.seats$, this.userState.controls$]).pipe(
            filter(([_seats, controls]) => !!controls),
            map(([seats, controls]) => {
                const overbookAllowed = checkPageFeatureAccess(
                    controls,
                    Features.dailyTourDispatch.name,
                    Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                    Features.dailyTourDispatch.pages.dailyTourDispatch.features
                        .otcAllowOverbook.name
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
                if (seats?.available) {
                    if (
                        totalParticipants &&
                        totalParticipants > seats.available
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
                editableFieldsFormControl.parent
                    ?.get('adults')
                    ?.setErrors(error);
                editableFieldsFormControl.parent
                    ?.get('children')
                    ?.setErrors(error);

                if (editableFieldsFormControl.parent?.get('adults')?.dirty) {
                    editableFieldsFormControl.parent
                        ?.get('children')
                        ?.markAsDirty();
                }
                if (editableFieldsFormControl.parent?.get('children')?.dirty) {
                    editableFieldsFormControl.parent
                        ?.get('adults')
                        ?.markAsDirty();
                }
                return error;
            })
        );
    };
    addOtcForm = new FormGroup({
        agent: new FormControl<AgentUser | null>(null, [Validators.required]),
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
        adults: new FormControl(0, [], [this.totalPassengersValidator]),
        children: new FormControl(0, [], [this.totalPassengersValidator]),
        infants: new FormControl(0),
        phoneNumber: new FormControl(''),
        email: new FormControl<string>(''),
        cruiseLine: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        shipId: new FormControl<number | null>(null),
        pickupLocationId: new FormControl<string>('', [Validators.required]),
        notes: new FormControl<string>(''),
        isComplimentary: new FormControl<boolean>(false),
    });
    agentUsers$ = this.operatorFiltersState.agentUsers$.pipe(
        map((agents) => agents.filter((agent) => agent.allowOtc === true))
    );

    cruiseLines$ = this.operatorFiltersState.cruiseLines$;
    cruiseShips$ = this.addOtcForm.controls.cruiseLine.valueChanges.pipe(
        tap(() => {
            this.addOtcForm.controls.shipId.reset();
        }),
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

    shipsInPort$ = new BehaviorSubject<ShipInPort[]>([]);
    status$ = new BehaviorSubject<UIStatus>('idle');
    addOtcModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.addOtc),
        distinctUntilChanged()
    );

    isOpen$ = this.addOtcModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.addOtcModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    selectedShipName$ = combineLatest([
        this.context$,
        this.addOtcForm.controls.cruiseLine.valueChanges.pipe(startWith(null)),
        this.addOtcForm.controls.shipId.valueChanges.pipe(startWith(null)),
    ]).pipe(
        switchMap(([context, cruiseLine, shipId]) => {
            if (cruiseLine === null) {
                return of(context?.shipName ?? '');
            }
            if (cruiseLine === 0) {
                return of('Book Direct');
            }
            if (cruiseLine > 0) {
                if (shipId === null) {
                    return this.cruiseLines$.pipe(
                        map((cruiseLineOptions) => {
                            return (
                                cruiseLineOptions?.find(
                                    (cruiseLineOption) =>
                                        cruiseLineOption.shipCompanyId ===
                                        cruiseLine
                                )?.shipCompanyName || ''
                            );
                        })
                    );
                }
                return from(
                    this.operatorFiltersState.getShipList(cruiseLine)
                ).pipe(
                    map((cruiseShipOptions) => {
                        return (
                            cruiseShipOptions?.find(
                                (cruiseShipOptions) =>
                                    cruiseShipOptions.shipId === shipId
                            )?.shipName || ''
                        );
                    })
                );
            }
            return of('');
        })
    );

    pickupLocations$ = combineLatest([
        this.context$,
        this.addOtcForm.controls.cruiseLine.valueChanges.pipe(startWith(null)),
    ]).pipe(
        switchMap(([context, cruiseLine]) => {
            if (context?.tourInventoryId) {
                if (cruiseLine === null) {
                    return from(
                        this.operatorFiltersState.getPickupLocation(
                            context.tourInventoryId,
                            false
                        )
                    );
                } else {
                    return from(
                        this.operatorFiltersState.getPickupLocation(
                            context.tourInventoryId,
                            true
                        )
                    );
                }
            }
            return of([]);
        })
    );

    displayOverbookWarning$ = new BehaviorSubject<boolean>(false);
    private isDestroyed$ = new Subject<void>();

    ngAfterViewInit(): void {
        this.operatorFiltersState.getDocks();
        this.operatorFiltersState.getAgentUsers();
        this.operatorFiltersState.getCruiseLines();
        this.context$
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((context) => {
                this.seats$.next(null);
                this.addOtcForm.reset();
                this.addOtcForm.markAsPristine();
                this.displayOverbookWarning$.next(false);
                if (context) {
                    this.assignmentState
                        .loadSingleCruiseSchedule(
                            context.tourDate,
                            context.tourInventoryId
                        )
                        .then((ships) => {
                            this.shipsInPort$.next(ships);
                        });

                    this.assignmentState
                        .getAlternateTourTimes(context.tourId, context.tourDate)
                        .then((tourTimes) => {
                            // if this does't return any results, it's most likely that the tour has been
                            // deleted/archived. Go to tours and services and restore the tour
                            if (tourTimes) {
                                const currentTour = tourTimes.find(
                                    (tour) =>
                                        tour.tourInventoryId ===
                                        context.tourInventoryId
                                );
                                if (currentTour) {
                                    this.seats$.next({
                                        available: currentTour.availableSeats,
                                        allocated:
                                            currentTour.tourInventoryAllocatedSeats,
                                    });
                                }
                            }
                        });
                } else {
                    // just display book direct
                    this.shipsInPort$.next([
                        {
                            shipName: 'Book Direct',
                            shipCompanyId: 0,
                            shipId: null,
                        },
                    ]);
                }
            });
        this.addOtcForm.controls.shipId.valueChanges
            .pipe(startWith(null), takeUntil(this.isDestroyed$))
            .subscribe((shipId) => {
                if (shipId) {
                    this.addOtcForm.controls.cruiseLine.patchValue(
                        this.shipsInPort$
                            .getValue()
                            .find((cruise) => cruise.shipId === shipId)
                            ?.shipCompanyId || null,
                        { emitEvent: false }
                    );
                } else {
                    this.addOtcForm.controls.cruiseLine.patchValue(0, {
                        emitEvent: false,
                    });
                }
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    save(context: AddOtcModalContext | null | undefined): void {
        if (!context) {
            return;
        }

        if (this.addOtcForm.invalid) {
            Object.values(this.addOtcForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });

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
                            this.submitBooking(context);
                        },
                        isPrimary: false,
                    },
                ],
            });
        } else {
            this.submitBooking(context);
        }
    }

    close(): void {
        this.status$.next('idle');
        this.addOtcForm.reset();
        this.addOtcForm.markAsPristine();
        this.displayOverbookWarning$.next(false);
        this.uiState.closeAddOtcModal();
    }

    private submitBooking(context: AddOtcModalContext): void {
        this.status$.next('loading');
        const userInfo = this.userState.aspNetUser$.getValue();
        if (!userInfo) {
            return;
        }
        const formValue = this.addOtcForm.getRawValue();

        this.assignmentState
            .addOtcBooking({
                bookingId: 0,
                shipCompanyId: formValue.cruiseLine,
                shipId: formValue.shipId || 0,
                pickUpLocation: formValue.pickupLocationId
                    ? formValue.pickupLocationId
                    : '',
                bookingFirstName: formValue.firstName || '',
                bookingLastName: formValue.lastName || '',
                email: userInfo.email,
                primaryPhoneNumber: formValue.phoneNumber || '',
                bookingNotes: formValue.notes || '',
                createdBy: userInfo.b2CUserId || '',
                partnerId: formValue.agent?.partnerId || 0,
                agentsGuestEmail: formValue.email || '',
                companyUniqueID: userInfo.companyUniqueID || '',
                tourId: context.tourId,
                bookingDate: context.tourDate?.toISOString(),
                bookingTime: context.tourInventoryTime,
                tourInventoryId: context.tourInventoryId,
                adults: formValue.adults || 0,
                children: formValue.children || 0,
                infants: formValue.infants || 0,
                leadFirstName: formValue.firstName || '',
                leadLastName: formValue.lastName || '',
                paymentType: 'InvoiceLater',
                isOTC: true,
                isComplimentary: formValue.isComplimentary || false,
            })
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
