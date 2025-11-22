import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageService } from '../../manage.service';
import { ConfirmationDialogMessages, UIState } from '@app/core';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-mobile-footer',
    templateUrl: './mobile-footer.component.html',
    styleUrls: ['./mobile-footer.component.scss'],
    imports: [CommonModule, ButtonModule],
})
export class MobileFooterComponent {
    manageService = inject(ManageService);
    uiState = inject(UIState);

    bookingGeneralInfo$ = this.manageService.bookingGeneralInfo$;

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
