import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    map,
    takeUntil,
} from 'rxjs';
import {
    ApiTourInventoryDTDAssignmentModel,
    AssignmentParticipationItem,
    UserState,
} from '@app/core';
import { BookingListComponent, GuestCountsComponent } from './components';
import { AssignmentsState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-confirm-guests-modal',
    templateUrl: './confirm-guests.component.html',
    styleUrls: ['./confirm-guests.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        GuestCountsComponent,
        BookingListComponent,
    ],
})
export class ConfirmGuestsModalComponent {
    assignmentState = inject(AssignmentsState);
    uiState = inject(UIState);
    userState = inject(UserState);
    confirmGuestsModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.confirmGuests),
        distinctUntilChanged()
    );

    isRefreshing$ = this.assignmentState.status$.pipe(
        map((status) => status.updateAssignment === 'loading')
    );
    isOpen$ = this.confirmGuestsModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.confirmGuestsModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    steps$ = new BehaviorSubject<'guestCounts' | 'bookingList'>('guestCounts');

    guestCounts$ = new BehaviorSubject<
        ApiTourInventoryDTDAssignmentModel | undefined
    >(undefined);

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.context$.pipe(takeUntil(this.destroyed$)).subscribe((context) => {
            const assignment = context?.assignment;
            if (context && assignment) {
                this.guestCounts$.next({
                    actualAdults: assignment.actualAdults || 0,
                    actualChildren: assignment.actualChildren || 0,
                    cruiseLineEscorts: assignment.cruiseLineEscorts || 0,
                    payingAdditionalGuests:
                        assignment.payingAdditionalGuests || 0,
                    specialNotes: assignment.specialNotes || '',
                    isClosed: assignment.isClosed,
                    tourInventoryId: assignment.tourInventoryId || 0,
                    dtdAssignmentGuideId: assignment.dtdAssignmentGuideId || 0,
                    createdBy: '',
                    final:
                        (assignment.actualAdults || 0) +
                        (assignment.actualChildren || 0) +
                        (assignment.cruiseLineEscorts || 0) +
                        (assignment.payingAdditionalGuests || 0),
                    equipmentNumber: assignment.equipmentNumber || null,
                    dtdAssignmentTransportationId:
                        assignment.dtdAssignmentTransportationId || null,
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    submitGuestCounts(
        guestCountsSubmitted: ApiTourInventoryDTDAssignmentModel
    ): void {
        this.guestCounts$.next(guestCountsSubmitted);
        this.displayBookingList();
    }

    submitParticipantsInfo = (
        participantsInfo: AssignmentParticipationItem[]
    ): Promise<void> => {
        const guestCounts = this.guestCounts$.getValue();
        if (!guestCounts) {
            return Promise.reject('Incomplete guest information');
        }
        return this.assignmentState
            .updateAssignment(guestCounts)
            .then(() => {
                if (participantsInfo.length > 0) {
                    return this.assignmentState.updateAssignmentParticipation(
                        participantsInfo
                    );
                }

                return Promise.resolve();
            })
            .then(() => {
                this.assignmentState.refresh(true);
                this.close();
                return Promise.resolve();
            });
    };

    displayGuestCounts(): void {
        this.steps$.next('guestCounts');
    }

    displayBookingList(): void {
        this.steps$.next('bookingList');
    }

    close(): void {
        this.displayGuestCounts();
        this.uiState.closeConfirmGuestsModal();
    }
}
