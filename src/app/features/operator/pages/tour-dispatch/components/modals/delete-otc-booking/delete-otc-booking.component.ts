import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, distinctUntilChanged, filter, BehaviorSubject, tap } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { OTCBookingItem } from '@app/core';
import { AssignmentsState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-delete-otc-booking',
    templateUrl: './delete-otc-booking.component.html',
    styleUrls: ['./delete-otc-booking.component.scss'],
    imports: [CommonModule, DialogModule, ButtonModule],
})
export class DeleteOtcBookingComponent {
    assignmentState = inject(AssignmentsState);
    uiState = inject(UIState);

    deleteOTCBookingModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteOTCBooking),
        distinctUntilChanged()
    );
    isLoading$ = this.assignmentState.status$.pipe(
        map((status) => status.updateAssignment === 'loading')
    );
    isOpen$ = this.deleteOTCBookingModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.deleteOTCBookingModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context),
        tap((modalContext) => (this.context = modalContext))
    );
    status$ = new BehaviorSubject<'idle' | 'loading' | 'success' | 'error'>(
        'idle'
    );

    private context:
        | {
              booking: OTCBookingItem;
              onSuccess?: (() => void) | undefined;
          }
        | undefined = undefined;

    close(): void {
        this.status$.next('idle');
        this.uiState.closeDeleteOTCBookingModal();
    }

    delete(bookingId?: number): void {
        if (!bookingId) {
            return;
        }
        this.status$.next('loading');
        this.assignmentState
            .deleteOTCBooking(bookingId)
            .then(() => {
                this.status$.next('success');
                this.uiState.closeDeleteOTCBookingModal();
                if (this.context?.onSuccess) {
                    this.context.onSuccess();
                }
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
