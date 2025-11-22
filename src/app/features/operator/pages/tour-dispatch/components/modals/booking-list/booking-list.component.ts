import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import {
    BehaviorSubject,
    Observable,
    Subject,
    distinctUntilChanged,
    filter,
    map,
    of,
    switchMap,
    takeUntil,
} from 'rxjs';
import { AssignmentsState, UIState } from '../../../state';
import {
    IconBookingSearchComponent,
    IconCruiseComponent,
    LoaderEmbedComponent,
    PermissionDirective,
    TourInventoryTimePipe,
} from '@app/shared';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import {
    AppAssignment,
    Features,
    OTCBookingItem,
    UIStatus,
    UserState,
    checkPageFeatureAccess,
    compressImage,
    isIOS,
    isTouchDevice,
    sortBookingByPickupLocationAndShipName,
} from '@app/core';
import {
    ModalEditBookingComponent,
    ModalTourDetailsComponent,
} from '../common';
import { MenuItem } from 'primeng/api';
import { TicketsComponent } from './tickets/tickets.component';
import { BookingState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-booking-list-modal',
    templateUrl: './booking-list.component.html',
    styleUrls: ['./booking-list.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        TooltipModule,
        MenuModule,
        LoaderEmbedComponent,
        IconBookingSearchComponent,
        DialogModule,
        TourInventoryTimePipe,
        IconCruiseComponent,
        ModalTourDetailsComponent,
        ModalEditBookingComponent,
        TicketsComponent,
        PermissionDirective,
    ],
})
export class BookingListModalComponent {
    assignmentsState = inject(AssignmentsState);
    bookingState = inject(BookingState);
    userState = inject(UserState);
    uiState = inject(UIState);

    allowEmbeddedCamera = !isIOS();
    touchDevice = isTouchDevice();
    bookingListModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.bookingList),
        distinctUntilChanged()
    );

    isOpen$ = this.bookingListModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.bookingListModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    isLoading$ = this.context$.pipe(
        switchMap((context) => {
            if (context?.assignment?.tourInventoryId) {
                return this.assignmentsState.loadBookingListStatus$.pipe(
                    map(
                        (statuses) =>
                            statuses[context.assignment.tourInventoryId]
                    )
                );
            }
            return of(false);
        })
    );

    menuSelectedBooking: OTCBookingItem | undefined = undefined;
    bookingToEdit$ = new BehaviorSubject<OTCBookingItem | undefined>(undefined);
    manageTicket: OTCBookingItem | undefined = undefined;
    bookingImages$ = this.bookingToEdit$.pipe(
        switchMap((booking) => {
            return this.bookingState.bookingImages$.pipe(
                map((images) => {
                    const bookingId = booking?.bookingId;
                    if (!bookingId) {
                        return [];
                    }
                    return images?.[bookingId.toString()];
                })
            );
        })
    );

    bookings$ = new BehaviorSubject<OTCBookingItem[]>([]);
    features = Features;

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
                                  if (this.menuSelectedBooking) {
                                      this.editBooking(
                                          this.menuSelectedBooking
                                      );
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
                                  if (this.menuSelectedBooking) {
                                      this.deleteBooking(
                                          this.menuSelectedBooking
                                      );
                                  }
                              },
                          },
                      ]
                    : []),
            ];
        })
    );
    assignment: AppAssignment | undefined = undefined;
    checkinStatus$ = new BehaviorSubject<UIStatus>('idle');
    private shouldRefreshOnClose = false;

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.isOpen$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
            this.bookingToEdit$.next(undefined);
            this.menuSelectedBooking = undefined;
        });
        this.context$.pipe(takeUntil(this.destroyed$)).subscribe((context) => {
            this.bookings$.next([]);
            this.assignment = context?.assignment;
            this.loadBookings();
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.checkinStatus$.next('idle');
        if (this.shouldRefreshOnClose) {
            this.assignmentsState.refresh(true);
        }
        this.shouldRefreshOnClose = false;
        this.manageTicket = undefined;
        this.uiState.closeBookingListModal();
    }

    checkinBooking(bookingId: number): void {
        this.checkinStatus$.next('loading');
        this.assignmentsState
            .checkinBooking(bookingId)
            .then(() => {
                this.shouldRefreshOnClose = true;
                const tourInventoryId = this.assignment?.tourInventoryId;
                if (tourInventoryId) {
                    return this.assignmentsState
                        .loadAssignmentBookingList(tourInventoryId, true)
                        .then((res) => {
                            this.bookings$.next(res);
                            const updatedBooking = res.find(
                                (booking) =>
                                    booking.bookingId ===
                                    this.bookingToEdit$.getValue()?.bookingId
                            );
                            this.bookingToEdit$.next(updatedBooking);
                            return Promise.resolve();
                        });
                }
                return Promise.resolve();
            })
            .then(() => {
                this.checkinStatus$.next('idle');
                this.onExitEditBoking();
            })
            .catch(() => {
                this.checkinStatus$.next('error');
            });
    }

    onSaveBooking(): void {
        this.shouldRefreshOnClose = true;
        this.onExitEditBoking();
    }

    onDeleteBooking(): void {
        this.shouldRefreshOnClose = true;
        this.onExitEditBoking();
    }

    onExitEditBoking(): void {
        this.bookingToEdit$.next(undefined);
        this.menuSelectedBooking = undefined;
        this.manageTicket = undefined;
        this.loadBookings();
    }

    editBooking(booking: OTCBookingItem): void {
        this.bookingToEdit$.next(booking);
        this.bookingState.loadBookingImages(booking.bookingId);
    }

    viewTickets(booking: OTCBookingItem): void {
        this.manageTicket = booking;
    }

    openEmbeddedCamera(booking: OTCBookingItem): void {
        this.uiState.openTicketCameraModal({
            booking,
            onSuccess: () => {
                this.bookingState.loadBookingImages(booking.bookingId);
            },
        });
    }

    uploadTicket(booking: OTCBookingItem): void {
        this.uiState.openTicketCameraModal({
            booking,
            onSuccess: () => {
                this.bookingState.loadBookingImages(booking.bookingId);
            },
        });
    }

    onImageSelect(event: Event, booking: OTCBookingItem): void {
        const file = (<HTMLInputElement>event.target).files?.[0];
        if (!file) {
            return;
        }
        compressImage(file, {
            quality: 0.7,
            type: 'image/jpeg',
        })
            .then((compressedFile) => {
                this.uploadSelectedPhoto(compressedFile, booking);
            })
            .catch(() => {
                this.uploadSelectedPhoto(file, booking);
            });
    }

    uploadSelectedPhoto(file: File, booking: OTCBookingItem): void {
        if (!file || !booking) {
            return;
        }
        this.bookingState
            .uploadTicketImage({
                bookingId: booking.bookingId,
                bookingImage: file,
                bookingImagePath: file.name,
                createdBy: '',
                imageId: '',
            })
            .then(() => {
                if (booking) {
                    this.bookingState.loadBookingImages(booking.bookingId);
                }
            })
            .catch(() => {
                // TODO: error handling
            });
    }

    onExitManageBookingTicket(_shouldRefresh: boolean): void {
        // TODO: refresh booking if shouldRefresh is true
        this.manageTicket = undefined;
    }

    deleteBooking(booking: OTCBookingItem): void {
        this.uiState.openDeleteOTCBookingModal({
            booking,
            onSuccess: () => {
                this.loadBookings();
            },
        });
    }

    private loadBookings(): void {
        if (this.assignment?.tourInventoryId) {
            this.assignmentsState
                .loadAssignmentBookingList(
                    this.assignment.tourInventoryId,
                    true
                )
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
}
