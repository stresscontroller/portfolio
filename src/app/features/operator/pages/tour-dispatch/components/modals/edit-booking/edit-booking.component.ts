import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    map,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { AssignmentsState, UIState } from '../../../state';
import {
    ModalEditBookingComponent,
    ModalTourDetailsComponent,
} from '../common';
import { ButtonModule } from 'primeng/button';
import { AppAssignment, OTCBookingItem, UIStatus } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-edit-booking-modal',
    templateUrl: './edit-booking.component.html',
    styleUrls: ['./edit-booking.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        ModalTourDetailsComponent,
        ModalEditBookingComponent,
        ButtonModule,
    ],
})
export class EditBookingModalComponent {
    uiState = inject(UIState);
    assignmentsState = inject(AssignmentsState);

    editBookingModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editBooking),
        distinctUntilChanged()
    );

    isOpen$ = this.editBookingModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.editBookingModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    checkinStatus$ = new BehaviorSubject<UIStatus>('idle');
    booking$ = new BehaviorSubject<OTCBookingItem | undefined>(undefined);
    private assignment: AppAssignment | undefined = undefined;
    private shouldRefreshOnClose = false;

    private isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.context$
            .pipe(
                takeUntil(this.isDestroyed$),
                map((context) => context)
            )
            .subscribe((context) => {
                this.assignment = context?.assignment;
                this.booking$.next(context?.booking);
            });
    }
    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    checkinBooking(tourInventoryId: number, bookingId: number): void {
        this.checkinStatus$.next('loading');
        this.assignmentsState
            .checkinBooking(bookingId)
            .then(() => {
                if (tourInventoryId) {
                    return this.assignmentsState
                        .loadAssignmentBookingList(tourInventoryId, true)
                        .then((res) => {
                            this.shouldRefreshOnClose = true;
                            this.checkinStatus$.next('idle');
                            this.booking$.next(
                                res.find(
                                    (booking) =>
                                        booking.bookingId ===
                                        this.booking$.getValue()?.bookingId
                                )
                            );
                            this.close();
                            return Promise.resolve();
                        });
                }
                this.checkinStatus$.next('idle');
                this.close();
                return Promise.resolve();
            })
            .catch(() => {
                this.checkinStatus$.next('error');
            });
    }

    modifiedAndClose(): void {
        this.shouldRefreshOnClose = true;
        this.close();
    }

    close(): void {
        this.checkinStatus$.next('idle');
        if (this.shouldRefreshOnClose && this.assignment) {
            this.assignmentsState.refresh(true);
        }
        this.shouldRefreshOnClose = false;
        this.uiState.closeEditBookingModal();
    }
}
