import { inject, Injectable } from '@angular/core';
import {
    Booking,
    AgentApiService,
    UIState,
    ErrorDialogMessages,
    UserState,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, map } from 'rxjs';

@Injectable()
export class BookingsService {
    bookings$ = new BehaviorSubject<Booking[]>([]);
    isLoading$ = new BehaviorSubject<boolean>(false);
    agentService = inject(AgentApiService);
    uiState = inject(UIState);
    userState = inject(UserState);

    getAgentBookingList(): void {
        this.isLoading$.next(true);
        this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return;
            }
            lastValueFrom(
                this.agentService
                    .getAgentBookingListByCompany(user.companyUniqueID, true)
                    .pipe(map((res) => res.data || []))
            )
                .then((data) => {
                    if (data && data.length > 0) {
                        this.bookings$.next(data);
                    } else {
                        this.bookings$.next([]);
                    }
                    this.isLoading$.next(false);
                })
                .catch((error) => {
                    this.bookings$.next([]);
                    this.isLoading$.next(false);
                    this.uiState.openErrorDialog({
                        title: error?.errorTitle
                            ? error.errorTitle
                            : ErrorDialogMessages.agent.manageBooking
                                  .getAgentBookingList.title,
                        description:
                            error?.errors &&
                            Array.isArray(error.errors) &&
                            error.errors.length > 0
                                ? error.errors[0]
                                : ErrorDialogMessages.agent.manageBooking
                                      .getAgentBookingList.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.agent.manageBooking
                                    .getAgentBookingList.buttons.close,
                                isPrimary: true,
                                onClick: () => {
                                    // close dialog
                                },
                            },
                        ],
                    });
                });
        });
    }
}
