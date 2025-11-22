export interface CancellationReason {
    cancellationReasonID: number;
    cancellationReasonName: string;
    refundPercentage: number;
}

export interface BookingCancellationRefundAmount {
    name: string;
    bookingId: number;
    bookingNumber: string;
    emailId: string;
    bookingTotalCost: number;
    refundAmount: number;
    refundPolicyDescription: string;
}

export interface DeleteBookingItem {
    reservationBookingId: string;
    cancellationReasonId: number;
    applyRefundPolicy: boolean;
    notes: string;
    createdBy: string;
    bookingCart: DeleteBookingCartItem[];
}

export interface DeleteBookingCartItem {
    bookingId: number;
    refundAmount: number;
}
