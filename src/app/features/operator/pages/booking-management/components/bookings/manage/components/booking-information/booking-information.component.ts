import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageService } from '../../manage.service';
import {
    AuthServiceCommon,
    ErrorDialogMessages,
    SuccessDialogMessages,
    UIState,
} from '@app/core';
import { BehaviorSubject } from 'rxjs';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-booking-information',
    templateUrl: './booking-information.component.html',
    styleUrls: ['./booking-information.component.scss'],
    imports: [CommonModule, ButtonModule],
})
export class BookingInformationComponent {
    manageService = inject(ManageService);
    authService = inject(AuthServiceCommon);
    uiState = inject(UIState);

    status$ = new BehaviorSubject<string>('idle');
    bookingGeneralInfo$ = this.manageService.bookingGeneralInfo$;

    resendEmail() {
        this.status$.next('loading');
        const isInHouseAgent = this.authService.isInHouseAgent();
        const bookingData = this.bookingGeneralInfo$.getValue();
        if (bookingData) {
            let timer: NodeJS.Timeout | null = null;
            this.manageService
                .resendEmail(bookingData.reservationBookingId, isInHouseAgent)
                .then(() => {
                    this.status$.next('success');
                    this.uiState.openSuccessDialog({
                        title: SuccessDialogMessages.agent.manageBooking
                            .successEmailSend.title,
                        description:
                            SuccessDialogMessages.agent.manageBooking
                                .successEmailSend.description,
                        buttons: [
                            {
                                text: SuccessDialogMessages.agent.manageBooking
                                    .successEmailSend.buttons.close,
                                isPrimary: true,
                                onClick: () => {
                                    if (timer) {
                                        try {
                                            clearTimeout(timer);
                                            timer = null;
                                        } catch (e) {
                                            // timer is cleared
                                        }
                                    }
                                },
                            },
                        ],
                    });
                    timer = setTimeout(() => {
                        this.close();
                    }, 2000);
                })
                .catch(() => {
                    this.uiState.openErrorDialog({
                        title: ErrorDialogMessages.agent.manageBooking
                            .errorEmailSend.title,
                        description:
                            ErrorDialogMessages.agent.manageBooking
                                .errorEmailSend.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.agent.manageBooking
                                    .errorEmailSend.buttons.close,
                                isPrimary: true,
                                onClick: () => {},
                            },
                        ],
                    });
                    this.status$.next('error');
                });
        }
    }

    close(): void {
        this.uiState.closeSuccessDialog();
    }
}
