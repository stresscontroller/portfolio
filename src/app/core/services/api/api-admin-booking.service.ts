import { Injectable, inject } from '@angular/core';
import {
    AdminTourInventory,
    AdminTourInventorySearch,
    AdminUpdateBooking,
    ApiRoutes,
    SettleAgentInvoiceParams,
} from '@app/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class ApiAdminBookingService {
    private http = inject(HttpClient);

    updateBooking(data: AdminUpdateBooking) {
        return this.http.post<{
            success: boolean;
            error?: string;
        }>(`${ApiRoutes.admin}ManageBooking`, data);
    }

    settleAgentInvoice(settleParams: SettleAgentInvoiceParams) {
        return this.http.post<{
            success: boolean;
            data: boolean;
            error?: string;
        }>(`${ApiRoutes.admin}SettleAgentInvoice`, settleParams);
    }

    getTourInventoryList(config: AdminTourInventorySearch) {
        return this.http.post<{
            success: boolean;
            data: AdminTourInventory[];
            error?: string;
        }>(`${ApiRoutes.admin}GetTourInventoryLIst`, config);
    }
}
