import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppAssignment, OTCBookingItem, AssignmentFilter } from '@app/core';

interface NotificationBannerContext {
    text: string;
    status: 'error' | 'loading';
}

export interface AddOtcModalContext extends AppAssignment {
    tourDate: Date;
}

interface UpdateStatusContext extends AppAssignment {
    tourDate?: Date;
}

@Injectable({
    providedIn: 'root',
})
export class UIState {
    banners$ = new BehaviorSubject<{
        notification: {
            isOpen: boolean;
            context?: NotificationBannerContext;
        };
    }>({
        notification: {
            isOpen: false,
        },
    });

    drawers$ = new BehaviorSubject<{
        filters: {
            isOpen: boolean;
        };
    }>({
        filters: {
            isOpen: false,
        },
    });
    modals$ = new BehaviorSubject<{
        addOtc: {
            isOpen: boolean;
            context?: AddOtcModalContext;
        };
        confirmGuests: {
            isOpen: boolean;
            context?: {
                assignment: AppAssignment;
                tourDate: Date;
                displayNotesSection?: boolean;
            };
        };
        sharePDF: {
            isOpen: boolean;
            context?: AssignmentFilter;
        };
        confirmParticipants: {
            isOpen: boolean;
        };
        updateStatus: {
            isOpen: boolean;
            context?: UpdateStatusContext;
        };
        assignmentNotes: {
            isOpen: boolean;
            context?: {
                assignment: AppAssignment;
                tourDate: Date;
            };
        };
        bookingList: {
            isOpen: boolean;
            context?: {
                assignment: AppAssignment;
                tourDate: Date;
            };
        };
        updateTransportation: {
            isOpen: boolean;
            context?: {
                assignment: AppAssignment;
                tourDate: Date;
            };
        };
        updatePrelims: {
            isOpen: boolean;
            context?: {
                assignment: AppAssignment;
                tourDate: Date;
            };
        };
        editBooking: {
            isOpen: boolean;
            context?: {
                assignment: AppAssignment;
                tourDate: Date;
                booking: OTCBookingItem;
            };
        };
        deleteOTCBooking: {
            isOpen: boolean;
            context?: {
                booking: OTCBookingItem;
                onSuccess?: () => void;
            };
        };
        updateDepartureTime: {
            isOpen: boolean;
            context?: {
                assignment: AppAssignment;
                tourDate: Date;
            };
        };
        joinDepartures: {
            isOpen: boolean;
            context?: {
                assignment: AppAssignment;
                allAssignments: AppAssignment[];
                tourDate: Date;
            };
        };
        checkIn: {
            isOpen: boolean;
        };
        ticketCamera: {
            isOpen: boolean;
            context?: {
                booking: OTCBookingItem;
                onSuccess: () => void;
            };
        };
    }>({
        addOtc: {
            isOpen: false,
        },
        confirmGuests: {
            isOpen: false,
        },
        sharePDF: {
            isOpen: false,
        },
        confirmParticipants: {
            isOpen: false,
        },
        updateStatus: {
            isOpen: false,
        },
        assignmentNotes: {
            isOpen: false,
        },
        bookingList: {
            isOpen: false,
        },
        updateTransportation: {
            isOpen: false,
        },
        updatePrelims: {
            isOpen: false,
        },
        editBooking: {
            isOpen: false,
        },
        deleteOTCBooking: {
            isOpen: false,
        },
        updateDepartureTime: {
            isOpen: false,
        },
        joinDepartures: {
            isOpen: false,
        },
        checkIn: {
            isOpen: false,
        },
        ticketCamera: {
            isOpen: false,
        },
    });

    openNotificationBanner(context: NotificationBannerContext): void {
        this.banners$.next({
            ...this.banners$.getValue(),
            notification: {
                isOpen: true,
                context: context,
            },
        });
    }

    closeNotificationBanner(): void {
        this.banners$.next({
            ...this.banners$.getValue(),
            notification: {
                isOpen: false,
            },
        });
    }

    openFilterDrawer(): void {
        this.drawers$.next({
            ...this.drawers$.getValue(),
            filters: {
                isOpen: true,
            },
        });
    }

    closeFilterDrawer(): void {
        this.drawers$.next({
            ...this.drawers$.getValue(),
            filters: {
                isOpen: false,
            },
        });
    }

    openAddOtcModal(context: AddOtcModalContext): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            addOtc: {
                isOpen: true,
                context: context,
            },
        });
    }

    closeAddOtcModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            addOtc: {
                isOpen: false,
            },
        });
    }

    openConfirmGuestsModal(context: {
        assignment: AppAssignment;
        tourDate: Date;
        displayNotesSection?: boolean;
    }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            confirmGuests: {
                isOpen: true,
                context,
            },
        });
    }

    closeConfirmGuestsModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            confirmGuests: {
                isOpen: false,
            },
        });
    }

    openSharePDFModal(filters: AssignmentFilter): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            sharePDF: {
                isOpen: true,
                context: filters,
            },
        });
    }

    closeSharePDFModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            sharePDF: {
                isOpen: false,
            },
        });
    }

    openConfirmParticipantsModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            confirmParticipants: {
                isOpen: true,
            },
        });
    }

    closeConfirmParticipantsModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            confirmParticipants: {
                isOpen: false,
            },
        });
    }

    openUpdateStatusModal(context: AppAssignment, tourDate?: Date): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            updateStatus: {
                isOpen: true,
                context: {
                    ...context,
                    tourDate,
                },
            },
        });
    }

    closeUpdateStatusModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            updateStatus: {
                isOpen: false,
            },
        });
    }

    openAssignmentNotesModal(context: {
        assignment: AppAssignment;
        tourDate: Date;
    }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            assignmentNotes: {
                isOpen: true,
                context,
            },
        });
    }

    closeAssignmentNotesModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            assignmentNotes: {
                isOpen: false,
            },
        });
    }

    openBookingListModal(context: {
        assignment: AppAssignment;
        tourDate: Date;
    }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            bookingList: {
                isOpen: true,
                context,
            },
        });
    }

    closeBookingListModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            bookingList: {
                isOpen: false,
            },
        });
    }

    openUpdateTransportationModal(context: {
        assignment: AppAssignment;
        tourDate: Date;
    }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            updateTransportation: {
                isOpen: true,
                context,
            },
        });
    }

    closeUpdateTransportationModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            updateTransportation: {
                isOpen: false,
            },
        });
    }

    openUpdatePrelimsModal(context: {
        assignment: AppAssignment;
        tourDate: Date;
    }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            updatePrelims: {
                isOpen: true,
                context,
            },
        });
    }

    closeUpdatePrelimsModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            updatePrelims: {
                isOpen: false,
            },
        });
    }

    openEditBookingModal(context: {
        assignment: AppAssignment;
        tourDate: Date;
        booking: OTCBookingItem;
    }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            editBooking: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditBookingModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            editBooking: {
                isOpen: false,
            },
        });
    }

    openDeleteOTCBookingModal(context: {
        booking: OTCBookingItem;
        onSuccess?: () => void;
    }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            deleteOTCBooking: {
                isOpen: true,
                context: context,
            },
        });
    }

    closeDeleteOTCBookingModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            deleteOTCBooking: {
                isOpen: false,
            },
        });
    }

    openUpdateDepartureTimeModal(context: {
        assignment: AppAssignment;
        tourDate: Date;
    }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            updateDepartureTime: {
                isOpen: true,
                context,
            },
        });
    }

    closeUpdateDepartureTimeModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            updateDepartureTime: {
                isOpen: false,
            },
        });
    }

    openJoinDeparturesModal(context: {
        assignment: AppAssignment;
        allAssignments: AppAssignment[];
        tourDate: Date;
    }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            joinDepartures: {
                isOpen: true,
                context,
            },
        });
    }

    closeJoinDeparturesModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            joinDepartures: {
                isOpen: false,
            },
        });
    }

    openCheckInModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            checkIn: {
                isOpen: true,
            },
        });
    }

    closeCheckInModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            checkIn: {
                isOpen: false,
            },
        });
    }

    openTicketCameraModal(context: {
        booking: OTCBookingItem;
        onSuccess: () => void;
    }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            ticketCamera: {
                isOpen: true,
                context,
            },
        });
    }

    closeTicketCameraModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            ticketCamera: {
                isOpen: false,
            },
        });
    }
}
