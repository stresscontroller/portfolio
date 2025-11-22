import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AssignmentsState, UIState } from '../../state';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AppAssignment, Features, OTCBookingItem } from '@app/core';
import { BehaviorSubject } from 'rxjs';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { DtdEditBookingComponent } from '../dtd-edit-booking/dtd-edit-booking.component';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    standalone: true,
    selector: 'app-dtd-bookings-list',
    templateUrl: './dtd-bookings-list.component.html',
    styleUrls: ['./dtd-bookings-list.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        AccordionModule,
        TableModule,
        TooltipModule,
        DtdEditBookingComponent,
        LoaderEmbedComponent,
        DividerModule,
        PermissionDirective,
    ],
})
export class DtdBookingsListComponent {
    @Input() assignment: AppAssignment | undefined = undefined;
    @Input() isDisplayed = false;
    @Output() isDisplayedChange = new EventEmitter<boolean>();
    features = Features;

    assignmentsState = inject(AssignmentsState);
    uiState = inject(UIState);
    isLoading$ = new BehaviorSubject<boolean>(false);
    bookings$ = new BehaviorSubject<OTCBookingItem[]>([]);

    editBookingPanelOpen$ = new BehaviorSubject<Record<number, boolean>>({});

    ngOnChanges(): void {
        if (this.isDisplayed && this.assignment?.tourInventoryId) {
            this.isLoading$.next(true);
            this.assignmentsState
                .loadAssignmentBookingList(this.assignment.tourInventoryId)
                .then((bookings) => {
                    this.bookings$.next(bookings);
                    this.isLoading$.next(false);
                })
                .catch(() => {
                    this.isLoading$.next(false);
                });
        }
    }

    editBooking(bookingId: number): void {
        this.editBookingPanelOpen$.next({
            ...this.editBookingPanelOpen$.getValue(),
            [bookingId]: true,
        });
    }

    deleteBooking(booking: OTCBookingItem): void {
        this.uiState.openDeleteOTCBookingModal({
            booking,
            onSuccess: () => {
                this.assignmentsState.refresh(true);
            },
        });
    }

    onCloseEditPanel(bookingId: number): void {
        this.editBookingPanelOpen$.next({
            ...this.editBookingPanelOpen$.getValue(),
            [bookingId]: false,
        });
    }
}
