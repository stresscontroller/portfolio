import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { AccordionModule } from 'primeng/accordion';
import {
    AppAssignment,
    AssignmentParticipationItem,
    OTCBookingItem,
    UIStatus,
    UserState,
    sortBookingByPickupLocationAndShipName,
} from '@app/core';
import {
    IconBookingSearchComponent,
    LoaderEmbedComponent,
    TourInventoryTimePipe,
} from '@app/shared';
import { AssignmentsState, UIState } from '../../../../../state';
import { ModalTourDetailsComponent } from '../../../common';
import { DtdEditBookingComponent } from '../dtd-edit-booking/dtd-edit-booking.component';

@Component({
    standalone: true,
    selector: 'app-booking-list',
    templateUrl: './booking-list.component.html',
    styleUrls: ['./booking-list.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        InputNumberModule,
        ButtonModule,
        InputTextareaModule,
        TableModule,
        AccordionModule,
        LoaderEmbedComponent,
        TourInventoryTimePipe,
        DtdEditBookingComponent,
        ModalTourDetailsComponent,
        IconBookingSearchComponent,
    ],
})
export class BookingListComponent {
    @Input() set assignment(value: AppAssignment | null | undefined) {
        this.context = value;
        this.loadBooking();
    }
    @Input() tourDate: Date | null | undefined;
    @Input() onNext: (
        participantsInfo: AssignmentParticipationItem[]
    ) => Promise<void> = () => {
        return Promise.resolve();
    };
    @Output() back = new EventEmitter<void>();

    userState = inject(UserState);
    uiState = inject(UIState);
    assignmentsState = inject(AssignmentsState);
    bookings: (OTCBookingItem & { total: number })[] = [];
    totalBooked: number = 0;
    actualsBooked: number = 0;
    editBookingPanelOpen$ = new BehaviorSubject<OTCBookingItem | undefined>(
        undefined
    );
    isLoadingBookings$ = new BehaviorSubject<boolean>(false);
    status$ = new BehaviorSubject<UIStatus>('idle');
    context: undefined | null | AppAssignment = undefined;

    editBooking(booking: OTCBookingItem): void {
        this.editBookingPanelOpen$.next(booking);
    }

    deleteBooking(booking: OTCBookingItem): void {
        this.uiState.openDeleteOTCBookingModal({
            booking: booking,
            onSuccess: () => {
                this.loadBooking();
            },
        });
    }

    onCloseEditPanel(): void {
        this.editBookingPanelOpen$.next(undefined);
    }

    onBack(): void {
        this.back.emit();
    }

    save(): void {
        this.status$.next('loading');
        this.onNext(
            this.bookings.map((booking) => {
                return {
                    bookingId: booking.bookingId,
                    totalBooked: booking.showCount,
                    noShowComment: booking.noShowComment || '',
                };
            })
        )
            .then(() => {
                this.status$.next('idle');
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    onReloadBookings(): void {
        this.loadBooking();
    }

    private loadBooking(): void {
        if (!this.context) {
            return;
        }
        this.isLoadingBookings$.next(true);
        this.assignmentsState
            .loadAssignmentBookingList(this.context.tourInventoryId, true, true)
            .then((bookingsList) => {
                this.totalBooked = 0; // Reset totals before recalculating
                this.actualsBooked = 0; // Reset totals before recalculating
                const sortedBooking =
                    sortBookingByPickupLocationAndShipName(bookingsList);
                this.bookings = sortedBooking.map((booking) => {
                    this.totalBooked += booking.totalBooked;
                    this.actualsBooked += booking.showCount;
                    return {
                        ...booking,
                        total: booking.totalBooked, // this will allow us to set a new totalBooked value
                    };
                });
                this.isLoadingBookings$.next(false);
            })
            .catch(() => {
                this.isLoadingBookings$.next(false);
            });
    }

    recalculateActualsBooked(): void {
        this.actualsBooked = this.bookings.reduce(
            (sum, booking) => sum + booking.showCount,
            0
        );
    }
}
