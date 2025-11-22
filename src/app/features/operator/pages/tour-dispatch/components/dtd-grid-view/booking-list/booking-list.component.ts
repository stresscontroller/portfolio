import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, map, of, switchMap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
    AppAssignment,
    Features,
    OTCBookingItem,
    UserState,
    checkPageFeatureAccess,
    isTouchDevice,
    sortBookingByPickupLocationAndShipName,
} from '@app/core';
import {
    IconBookingSearchComponent,
    LoaderEmbedComponent,
    PermissionDirective,
} from '@app/shared';
import { AssignmentsState, UIState } from '../../../state';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
    standalone: true,
    selector: 'app-booking-list',
    templateUrl: './booking-list.component.html',
    styleUrls: ['./booking-list.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TableModule,
        TooltipModule,
        MenuModule,
        LoaderEmbedComponent,
        IconBookingSearchComponent,
        PermissionDirective,
    ],
})
export class BookingListComponent {
    @Input() assignment: AppAssignment | undefined = undefined;
    @Input() isDisplayed = false;
    @Output() isDisplayedChange = new EventEmitter<boolean>();

    assignmentsState = inject(AssignmentsState);
    userState = inject(UserState);
    uiState = inject(UIState);

    touchDevice = isTouchDevice();

    bookings$ = new BehaviorSubject<OTCBookingItem[]>([]);
    tourInventoryId$ = new BehaviorSubject<number | undefined>(undefined);
    isLoading$ = this.tourInventoryId$.pipe(
        switchMap((tourInventoryId) => {
            if (tourInventoryId) {
                return this.assignmentsState.loadBookingListStatus$.pipe(
                    map((statuses) => statuses[tourInventoryId])
                );
            }
            return of(false);
        })
    );
    features = Features;

    selectedBooking: OTCBookingItem | undefined = undefined;
    dataOptions$: Observable<MenuItem[]> = this.userState.controls$.pipe(
        map((featureControls) => {
            return [
                ...(checkPageFeatureAccess(
                    featureControls,
                    Features.dailyTourDispatch.name,
                    Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                    Features.dailyTourDispatch.pages.dailyTourDispatch.features
                        .bookingUpdate.name
                )
                    ? [
                          {
                              label: 'Edit',
                              icon: 'pi pi-pencil',
                              command: () => {
                                  if (this.selectedBooking) {
                                      this.editBooking(this.selectedBooking);
                                  }
                              },
                          },
                      ]
                    : []),
                ...(checkPageFeatureAccess(
                    featureControls,
                    Features.dailyTourDispatch.name,
                    Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                    Features.dailyTourDispatch.pages.dailyTourDispatch.features
                        .bookingDelete.name
                )
                    ? [
                          {
                              label: 'Delete',
                              icon: 'pi pi-trash',
                              command: () => {
                                  if (this.selectedBooking) {
                                      this.deleteBooking(this.selectedBooking);
                                  }
                              },
                          },
                      ]
                    : []),
            ];
        })
    );

    ngOnChanges(): void {
        if (this.isDisplayed && this.assignment?.tourInventoryId) {
            this.tourInventoryId$.next(this.assignment.tourInventoryId);
            this.assignmentsState
                .loadAssignmentBookingList(this.assignment.tourInventoryId)
                .then((bookings) => {
                    this.bookings$.next(
                        sortBookingByPickupLocationAndShipName(bookings)
                    );
                })
                .catch(() => {
                    this.bookings$.next([]);
                });
        }
    }

    expandBookingList(): void {
        if (!this.assignment) {
            return;
        }
        this.uiState.openBookingListModal({
            assignment: this.assignment,
            tourDate:
                this.assignmentsState.configs$.getValue().dateSelected ||
                new Date(),
        });
    }

    editBooking(booking: OTCBookingItem): void {
        if (!this.assignment) {
            return;
        }
        this.uiState.openEditBookingModal({
            assignment: this.assignment,
            tourDate:
                this.assignmentsState.configs$.getValue().dateSelected ||
                new Date(),
            booking,
        });
    }
    deleteBooking(booking: OTCBookingItem): void {
        this.uiState.openDeleteOTCBookingModal({ booking });
    }
}
