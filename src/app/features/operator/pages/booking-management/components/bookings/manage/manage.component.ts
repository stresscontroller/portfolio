import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, Input } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
    AgentInformationComponent,
    BookingInformationComponent,
    CancelBookingModalComponent,
    CreditCardInfoModalComponent,
    MobileFooterComponent,
    ModifyCruiseModalComponent,
    ModifyTimeModalComponent,
    NotesComponent,
    PassengerInformationComponent,
    PickupInformationComponent,
    PriceSummaryComponent,
    TourCardComponent,
} from './components';
import { ManageService } from './manage.service';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import {
    AdditionalBookingDetails,
    ApiPickupLocationItem,
    BookingDetails,
    ConfirmationDialogMessages,
    ShipByTour,
    TourInventoryDetails,
    TourTimes,
    UIState,
    UnsavedComponent,
} from '@app/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PermissionConfig, PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-booking-manage',
    templateUrl: './manage.component.html',
    styleUrls: ['./manage.component.scss', '../bookings.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        DialogModule,
        DividerModule,
        ProgressSpinnerModule,
        BookingInformationComponent,
        NotesComponent,
        PassengerInformationComponent,
        PickupInformationComponent,
        PriceSummaryComponent,
        TourCardComponent,
        MobileFooterComponent,
        TooltipModule,
        AgentInformationComponent,
        CancelBookingModalComponent,
        CreditCardInfoModalComponent,
        ModifyCruiseModalComponent,
        ModifyTimeModalComponent,
        PermissionDirective,
    ],
    providers: [ManageService],
})
export class ManageComponent implements UnsavedComponent {
    @Input() deletePermission?: PermissionConfig;
    @Input() updatePermission?: PermissionConfig;
    @Input() set reservationBookingId(value: string | null) {
        if (value) {
            // this.manageService.hasUnsavedChanges = false;
            this.manageService.getBooking(value);
        }
        this.manageService.init();
    }
    manageService = inject(ManageService);
    uiState = inject(UIState);

    hasUnsavedChanges$ = this.manageService.hasUnsavedChanges$;
    tourList$: Observable<
        {
            originalBookingDetails: BookingDetails;
            bookingDetails: BookingDetails & {
                bookingDateIsInThePast?: boolean;
            };
            tourDetails: TourInventoryDetails;
            additionalBookingDetails?: AdditionalBookingDetails | undefined;
            pickupLocations: ApiPickupLocationItem[];
            tourTimes: TourTimes[];
            shipList: ShipByTour[];
        }[]
    > = this.manageService.booking$.pipe(
        map((tours) => {
            if (tours && tours.length > 0) {
                // default to 12 am today
                const targetDate = new Date(
                    new Date(new Date().setDate(new Date().getDate())).setHours(
                        0,
                        0,
                        0,
                        0
                    )
                );
                return tours.map((tour) => {
                    return {
                        ...tour,
                        bookingDetails: {
                            ...tour.bookingDetails,
                            bookingDateIsInThePast:
                                targetDate.getTime() -
                                    new Date(
                                        tour.bookingDetails.bookingDate
                                    ).getTime() >
                                0,
                        },
                    };
                });
            }
            return [];
        })
    );
    isActive$ = this.manageService.bookingGeneralInfo$.pipe(
        map((bookingGeneralInfo) => bookingGeneralInfo?.isActive)
    );

    isLoading$ = this.manageService.isLoading$;

    bookingDateIsInThePast$ = this.tourList$.pipe(
        map((tours) => {
            if (tours && tours.length > 0) {
                return tours.every((tour) => {
                    return tour.bookingDetails.bookingDateIsInThePast === true;
                });
            }
            return false;
        })
    );

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    @HostListener('window:beforeunload', ['$event'])
    canDeactivate($event: any): Observable<boolean> | boolean {
        // returning true will navigate without confirmation
        // returning false will show a confirm dialog before navigating away

        if (this.hasUnsavedChanges$.getValue()) {
            $event.returnValue = 'You have unsaved changes';
            return false;
        }
        return true;
    }

    save(): void {
        this.uiState.openConfirmationDialog({
            title: ConfirmationDialogMessages.agent.manageBooking.modifyBooking
                .title,
            description:
                ConfirmationDialogMessages.agent.manageBooking.modifyBooking
                    .description,
            buttons: [
                {
                    text: ConfirmationDialogMessages.agent.manageBooking
                        .modifyBooking.buttons.backToBooking,
                    onClick: () => {},
                    isPrimary: true,
                },
                {
                    text: ConfirmationDialogMessages.agent.manageBooking
                        .modifyBooking.buttons.saveOrder,
                    onClick: () => {
                        this.manageService.updateBooking();
                    },
                    isPrimary: false,
                },
            ],
        });
    }

    cancel(): void {
        this.uiState.openConfirmationDialog({
            title: ConfirmationDialogMessages.agent.manageBooking.cancelOrder
                .title,
            description:
                ConfirmationDialogMessages.agent.manageBooking.cancelOrder
                    .description,
            buttons: [
                {
                    text: ConfirmationDialogMessages.agent.manageBooking
                        .cancelOrder.buttons.backToBooking,
                    onClick: () => {},
                    isPrimary: true,
                },
                {
                    text: ConfirmationDialogMessages.agent.manageBooking
                        .cancelOrder.buttons.cancelOrderAnyways,
                    onClick: () => {
                        this.manageService.cancelBooking();
                    },
                    isPrimary: false,
                },
            ],
        });
    }
}
