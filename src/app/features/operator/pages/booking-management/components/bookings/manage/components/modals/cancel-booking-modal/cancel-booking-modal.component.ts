import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    lastValueFrom,
    map,
    takeUntil,
    tap,
} from 'rxjs';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ManageService } from '../../../manage.service';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import {
    ApiAgentModifyBookingService,
    BookingCancellationRefundAmount,
    CancellationReason,
    ErrorDialogMessages,
    GeneralBookingInfo,
    SuccessDialogMessages,
    UIState,
} from '@app/core';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    standalone: true,
    selector: 'app-cancel-booking-modal',
    templateUrl: './cancel-booking-modal.component.html',
    styleUrls: ['./cancel-booking-modal.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextareaModule,
        CheckboxModule,
        DropdownModule,
        DialogModule,
    ],
})
export class CancelBookingModalComponent {
    manageService = inject(ManageService);
    apiModifyBookingService = inject(ApiAgentModifyBookingService);
    uiState = inject(UIState);
    private context:
        | {
              cancellationReasons: CancellationReason[];
              generalBookingInfo: GeneralBookingInfo;
              userId: string;
          }
        | undefined;
    originalBookingAmount = 0;
    estimatedRefundAmount = 0;
    refundPolicyDescription = '';
    selectedRefunds: BookingCancellationRefundAmount[] = [];

    cancelBookingModal$ = this.manageService.modals$.pipe(
        map((modals) => modals.cancelBooking),
        distinctUntilChanged()
    );
    isLoading$ = new BehaviorSubject<boolean>(false);
    isOpen$ = this.cancelBookingModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.cancelBookingModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context),
        tap((context) => {
            this.context = context;
            this.calculateEstimatedRefundAmount(0);
        })
    );

    cancellationForm = new FormGroup({
        cancellationReasonId: new FormControl(null, Validators.required),
        notes: new FormControl(''),
        refundAmount: new FormControl<number>(0),
        applyRefundPolicy: new FormControl(true),
    });

    private isDestroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.cancellationForm.controls.cancellationReasonId.valueChanges
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((cancellationReasonId) => {
                if (cancellationReasonId) {
                    this.calculateEstimatedRefundAmount(cancellationReasonId);
                }
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    submitCancellation(): void {
        // uncomment these if we re-enable the forms in the template
        // const cancellationReasonId =
        //     this.cancellationForm.value.cancellationReasonId;
        // if (!cancellationReasonId) {
        //     this.cancellationForm.controls.cancellationReasonId.markAsDirty();
        //     this.cancellationForm.controls.cancellationReasonId.markAsTouched();
        //     return;
        // }
        const reservationBookingId =
            this.context?.generalBookingInfo.reservationBookingId;
        if (!this.selectedRefunds || !this.context || !reservationBookingId) {
            this.uiState.openErrorDialog({
                title: ErrorDialogMessages.agent.manageBooking.cancelBooking
                    .title,
                description:
                    ErrorDialogMessages.agent.manageBooking.cancelBooking
                        .description,
                buttons: [
                    {
                        text: ErrorDialogMessages.agent.manageBooking
                            .cancelBooking.buttons.close,
                        onClick: () => {
                            this.close();
                        },
                    },
                ],
            });
            return;
        }
        this.isLoading$.next(true);
        const formValues = this.cancellationForm.getRawValue();
        this.manageService
            .submitCancelBooking({
                reservationBookingId: reservationBookingId,
                cancellationReasonId: formValues.cancellationReasonId || 0,
                applyRefundPolicy: formValues.applyRefundPolicy || false,
                notes: formValues.notes || '',
                createdBy: this.context.userId,
                bookingCart: this.selectedRefunds.map((booking) => {
                    return {
                        bookingId: booking.bookingId,
                        refundAmount: booking.refundAmount,
                    };
                }),
            })
            .then(() => {
                this.isLoading$.next(false);
                this.uiState.openSuccessDialog({
                    title: SuccessDialogMessages.agent.manageBooking
                        .cancelBooking.title,
                    description:
                        SuccessDialogMessages.agent.manageBooking.cancelBooking
                            .description,
                    buttons: [
                        {
                            text: SuccessDialogMessages.agent.manageBooking
                                .cancelBooking.buttons.close,
                            onClick: () => {
                                this.close();
                            },
                        },
                    ],
                });
            })
            .catch(() => {
                this.isLoading$.next(false);
                this.uiState.openErrorDialog({
                    title: ErrorDialogMessages.agent.manageBooking.cancelBooking
                        .title,
                    description:
                        ErrorDialogMessages.agent.manageBooking.cancelBooking
                            .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.agent.manageBooking
                                .cancelBooking.buttons.close,
                            onClick: () => {
                                this.close();
                            },
                        },
                    ],
                });
            });
    }

    close(): void {
        this.manageService.closeCancelBookingModal();
    }

    private calculateEstimatedRefundAmount(selectedReasonId: number) {
        const reservationBookingId =
            this.context?.generalBookingInfo.reservationBookingId;
        if (reservationBookingId) {
            lastValueFrom(
                this.apiModifyBookingService
                    .getBookingCancellationRefundAmount(
                        reservationBookingId,
                        true,
                        selectedReasonId
                    )
                    .pipe(map((res) => res.data))
            )
                .then((data) => {
                    this.selectedRefunds = data;
                    this.originalBookingAmount = data.reduce((acc, curr) => {
                        acc += curr.bookingTotalCost;
                        return acc;
                    }, 0);
                    this.estimatedRefundAmount = data.reduce((acc, curr) => {
                        acc += curr.refundAmount;
                        return acc;
                    }, 0);
                    // TODO: we might need this to be handled at a tour level
                    this.refundPolicyDescription =
                        data[0].refundPolicyDescription;
                })
                .catch((error) => {
                    this.uiState.openErrorDialog({
                        title: error?.errorTitle
                            ? error.errorTitle
                            : ErrorDialogMessages.agent.manageBooking
                                  .calculateEstimatedRefundAmount.title,
                        description:
                            error?.errors &&
                            Array.isArray(error.errors) &&
                            error.errors.length > 0
                                ? error.errors[0]
                                : ErrorDialogMessages.agent.manageBooking
                                      .calculateEstimatedRefundAmount
                                      .description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.agent.manageBooking
                                    .calculateEstimatedRefundAmount.buttons
                                    .close,
                                isPrimary: true,
                                onClick: () => {
                                    // close dialog
                                },
                            },
                        ],
                    });

                    // TODO: need to add some sort of error handling
                });
        }
    }
}
