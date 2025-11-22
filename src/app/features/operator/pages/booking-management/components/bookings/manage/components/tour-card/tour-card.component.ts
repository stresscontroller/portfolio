import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageService, TourDetailsEdit } from '../../manage.service';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import {
    ApiPickupLocationItem,
    BookingDetails,
    ConfirmationDialogMessages,
    ShipByTour,
    TourInventoryDetails,
    TourTimes,
    UIState,
} from '@app/core';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, combineLatest, startWith, takeUntil } from 'rxjs';
import { CustomTimePipe } from '../../pipes';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { PickupInformationComponent } from '../pickup-information/pickup-information.component';
import {
    PermissionConfig,
    PermissionDirective,
    ParticipantsPipe,
} from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-tour-card',
    templateUrl: './tour-card.component.html',
    styleUrls: ['./tour-card.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        DividerModule,
        InputTextModule,
        InputNumberModule,
        CustomTimePipe,
        TooltipModule,
        ParticipantsPipe,
        PickupInformationComponent,
        BadgeModule,
        PermissionDirective,
    ],
})
export class TourCardComponent {
    @Input() updatePermission?: PermissionConfig;
    @Input() tour?: {
        originalBookingDetails: BookingDetails;
        bookingDetails: BookingDetails;
        tourDetails: TourInventoryDetails;
        pickupLocations: ApiPickupLocationItem[];
        tourTimes: TourTimes[];
        shipList: ShipByTour[];
    };
    @Input() index = 1;

    uiState = inject(UIState);
    manageService = inject(ManageService);
    totalPassengersValidator = (editableFieldsFormControl: AbstractControl) => {
        const adults = editableFieldsFormControl.get('bookingAdults')?.value;
        const children =
            editableFieldsFormControl.get('bookingChildren')?.value;
        let error = null;
        const totalParticipants = adults + children;
        if (totalParticipants === 0) {
            error = { totalPassengersIsZero: true };
        }

        const tourInventoryId = this.tour?.bookingDetails?.tourInventoryID;
        if (this.tour?.tourTimes && tourInventoryId) {
            const selectedTourTime = this.tour.tourTimes.find(
                (tourTime) => tourTime.tourInventoryId === tourInventoryId
            );
            if (selectedTourTime && selectedTourTime.availableSeats > 0) {
                // factor in the current participants
                if (
                    this.tour.originalBookingDetails.tourInventoryID ===
                        selectedTourTime.tourInventoryId &&
                    totalParticipants >
                        selectedTourTime.availableSeats +
                            (this.tour.originalBookingDetails.bookingAdults ||
                                0) +
                            (this.tour.originalBookingDetails.bookingChildren ||
                                0)
                ) {
                    error = {
                        ...error,
                        exceededAvailableSeats: true,
                    };
                }
                if (
                    this.tour.originalBookingDetails.tourInventoryID !==
                        selectedTourTime.tourInventoryId &&
                    totalParticipants > selectedTourTime.availableSeats
                ) {
                    error = {
                        ...error,
                        exceededAvailableSeats: true,
                    };
                }
            } else {
                error = {
                    ...error,
                    exceededAvailableSeats: true,
                };
            }
        }
        // mark both fields as dirty so we can display the red error border
        editableFieldsFormControl.get('bookingAdults')?.markAsDirty();
        editableFieldsFormControl.get('bookingAdults')?.setErrors(error);
        editableFieldsFormControl.get('bookingChildren')?.markAsDirty();
        editableFieldsFormControl.get('bookingChildren')?.setErrors(error);
        return error;
    };
    tourDetailsForm = new FormGroup(
        {
            bookingLeadTravelerFirst: new FormControl('', Validators.required),
            bookingLeadTravelerLast: new FormControl('', Validators.required),
            bookingAdults: new FormControl(0),
            bookingChildren: new FormControl(0),
            bookingInfants: new FormControl(0),
        },
        {
            validators: this.totalPassengersValidator,
        }
    );

    alternateTimeDisabled = true;
    alternateArrivalMethodDisabled = true;

    // use this to prevent users adding more users than the available seat for the tour
    participantsLimit: {
        adults: number;
        children: number;
    } = {
        adults: 0,
        children: 0,
    };

    private readonly isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.manageService.updateValidation(null);
        this.tourDetailsForm.valueChanges
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((res) => {
                const bookingID = this.tour?.bookingDetails?.bookingID;
                if (bookingID) {
                    this.manageService.updateTourDetails(
                        bookingID,
                        res as TourDetailsEdit
                    );
                    this.manageService.updateValidation(
                        this.tourDetailsForm.errors
                    );
                }
                this.checkAvailableTimes();
                this.checkAvailableArrivalMethod();
            });
    }

    ngOnChanges(): void {
        this.tourDetailsForm.patchValue({
            bookingLeadTravelerFirst: this.tour?.bookingDetails?.leadFirstName,
            bookingLeadTravelerLast: this.tour?.bookingDetails?.leadLastName,
            bookingAdults: this.tour?.bookingDetails?.bookingAdults,
            bookingChildren: this.tour?.bookingDetails?.bookingChildren,
            bookingInfants: this.tour?.bookingDetails?.bookingInfants,
        });
        this.checkAvailableTimes();
        this.checkAvailableArrivalMethod();
        this.handleParticipantsChange();
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next(undefined);
        this.isDestroyed$.complete();
    }

    viewAlternateTimes(): void {
        const bookingId = this.tour?.bookingDetails.bookingID;
        if (bookingId) {
            const formValue = this.tourDetailsForm.getRawValue();
            const totalParticipants =
                (formValue.bookingAdults || 0) +
                (formValue.bookingChildren || 0);
            this.manageService.openModifyTimeModal(
                bookingId,
                totalParticipants
            );
        }
    }

    changeArrivalMethod(): void {
        const bookingId = this.tour?.bookingDetails.bookingID;
        if (bookingId) {
            this.manageService.openModifyCruiseModal(bookingId);
        }
    }

    removeDialog(): void {
        this.uiState.openConfirmationDialog({
            title: ConfirmationDialogMessages.agent.manageBooking.removeTour
                .title,
            description:
                ConfirmationDialogMessages.agent.manageBooking.removeTour
                    .description,
            buttons: [
                {
                    text: ConfirmationDialogMessages.agent.manageBooking
                        .removeTour.buttons.backToBooking,
                    onClick: () => {},
                    isPrimary: true,
                },
                {
                    text: ConfirmationDialogMessages.agent.manageBooking
                        .removeTour.buttons.removeTour,
                    onClick: () => {
                        const bookingId = this.tour?.bookingDetails.bookingID;
                        if (bookingId) {
                            this.manageService.removeTour(bookingId);
                        }
                    },
                    isPrimary: false,
                },
            ],
        });
    }

    private checkAvailableArrivalMethod(): void {
        if (!this.tour?.shipList || this.tour?.shipList.length === 1) {
            this.alternateArrivalMethodDisabled = true;
            return;
        }
        this.alternateArrivalMethodDisabled = false;
    }

    private checkAvailableTimes(): void {
        if (!this.tour || !this.tour.tourTimes) {
            this.alternateTimeDisabled = true;
            return;
        }

        const otherAvailableTourTimes = this.tour.tourTimes.filter(
            (bookingTime) =>
                bookingTime.tourInventoryId !==
                this.tour?.originalBookingDetails.tourInventoryID
        );
        if (otherAvailableTourTimes.length === 0) {
            this.alternateTimeDisabled = true;
            return;
        }
        const form = this.tourDetailsForm.getRawValue();
        const totalParticipants =
            (form.bookingAdults || 0) + (form.bookingChildren || 0);
        if (
            otherAvailableTourTimes.filter((bookingTime) => {
                return (
                    bookingTime.availableSeats > 0 &&
                    totalParticipants <= bookingTime.availableSeats
                );
            }).length > 0
        ) {
            this.alternateTimeDisabled = false;
        } else {
            this.alternateTimeDisabled = true;
        }
    }

    private handleParticipantsChange(): void {
        combineLatest([
            this.tourDetailsForm.controls.bookingAdults.valueChanges,
            this.tourDetailsForm.controls.bookingChildren.valueChanges,
        ])
            .pipe(
                startWith([
                    this.tour?.bookingDetails?.bookingAdults,
                    this.tour?.bookingDetails?.bookingChildren,
                ]),
                takeUntil(this.isDestroyed$)
            )
            .subscribe(([adults, children]) => {
                const totalParticipants =
                    (this.tour?.bookingDetails?.bookingAdults || 0) +
                    (this.tour?.bookingDetails?.bookingChildren || 0);
                if (this.tour && this.tour.tourTimes) {
                    const tourInventoryId =
                        this.tour?.bookingDetails?.tourInventoryID;
                    const selectedTourTime = this.tour.tourTimes.find(
                        (tourTime) =>
                            tourTime.tourInventoryId === tourInventoryId
                    );
                    const remainingAvailableSeats =
                        (selectedTourTime?.availableSeats || 0) +
                        totalParticipants;
                    this.participantsLimit = {
                        adults: remainingAvailableSeats - (children || 0),
                        children: remainingAvailableSeats - (adults || 0),
                    };
                }
            });
    }
}
