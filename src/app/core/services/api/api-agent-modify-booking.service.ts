import { Injectable, inject } from '@angular/core';
import {
    ApiRoutes,
    BookingCancellationRefundAmount,
    BookingCartAmount,
    CancellationReason,
    CompleteBookingDetails,
    DeleteBookingItem,
    GetBookingAmountDetail,
    UpdateBookingDetails,
} from '@app/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class ApiAgentModifyBookingService {
    private http = inject(HttpClient);

    getTotalBookingAmount(data: GetBookingAmountDetail) {
        return this.http.post<{
            success: boolean;
            data: BookingCartAmount;
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetTotalBookingAmount`, data);
    }

    getBookingChargeAmount(data: CompleteBookingDetails) {
        return this.http
            .post<{
                success: boolean;
                data: {
                    success: boolean;
                    data: BookingCartAmount[];
                    errors?: string[];
                };
                errors?: string[];
            }>(`${ApiRoutes.agent}GetBookingChargeAmount`, data)
            .pipe(map((res) => res.data));
    }

    manageBooking(data: UpdateBookingDetails) {
        return this.http.post<{
            success: boolean;
            data: {
                success: boolean;
                data: UpdateBookingDetails;
                error?: string[];
            };
            error?: string;
        }>(`${ApiRoutes.agent}ManageBooking`, data);
    }

    manageBookingWithRefund(data: UpdateBookingDetails) {
        return this.http.post<{
            success: boolean;
            data: {
                success: boolean;
                data: UpdateBookingDetails;
                error?: string[];
            };
            error?: string;
        }>(`${ApiRoutes.agent}ManageBookingWithRefund`, data);
    }

    resendEmail(
        bookingID: string,
        isInhouseAgent: boolean
    ): Observable<{
        success: boolean;
        data: {
            success: boolean;
            data: string;
            error?: string[];
        };
        error?: string;
    }> {
        let params = new HttpParams();
        params = params.append('reservationBookingId', bookingID);
        params = params.append('isInhouseAgent', isInhouseAgent);

        return this.http.get<{
            success: boolean;
            data: {
                success: boolean;
                data: string;
                error?: string[];
            };
            error?: string;
        }>(`${ApiRoutes.email}BookingConfirm_SendEmail`, {
            params: params,
        });
    }

    updateBooking(data: CompleteBookingDetails) {
        return this.http.post<{
            success: boolean;
            data: CompleteBookingDetails;
            errors?: string[];
        }>(`${ApiRoutes.agent}ManageBooking`, data);
    }

    getCancellationReasonList() {
        return this.http.get<{
            success: boolean;
            data: CancellationReason[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetCancellationReasonList`);
    }

    getBookingCancellationRefundAmount(
        reservationBookingId: string,
        applyRefundPolicy: boolean,
        cancellationReasonID: number
    ) {
        let params = new HttpParams();
        params = params.append('reservationBookingId', reservationBookingId);
        params = params.append('applyRefundPolicy', applyRefundPolicy);
        params = params.append('cancellationReasonID', cancellationReasonID);
        return this.http.get<{
            success: boolean;
            data: BookingCancellationRefundAmount[];
            error?: string;
        }>(`${ApiRoutes.agent}GetBookingCancellationRefundAmount`, {
            params: params,
        });
    }

    getBookingTransactionStatus(reservationBookingId: string) {
        let params = new HttpParams();
        params = params.append('reservationBookingId', reservationBookingId);
        return this.http.get<{
            success: boolean;
            data: string;
            error?: string;
        }>(`${ApiRoutes.agent}GetBookingTransactionStatus`, {
            params: params,
        });
    }

    deleteBooking(data: DeleteBookingItem) {
        return this.http.post<{
            success: boolean;
            data: string;
            error?: string;
        }>(`${ApiRoutes.agent}DeleteBooking`, data);
    }
}
