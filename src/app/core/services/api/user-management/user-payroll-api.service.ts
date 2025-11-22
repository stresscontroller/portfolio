import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../../constants';
import { PayrollListItem, PayrollItemConfig } from '@app/core';

@Injectable({
    providedIn: 'root',
})
export class UserPayrollApiService {
    private http = inject(HttpClient);

    loadPayRateAmount(companyId: string, positionId: number) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('positionId', positionId);
        return this.http.get<{
            success: boolean;
            data: number;
            error?: string;
        }>(`${ApiRoutes.user}GetPayRateAmountByPositionId`, {
            params: params,
        });
    }

    loadPayrollDetails(userId: string) {
        let params = new HttpParams();
        params = params.append('userId', userId);
        return this.http.get<{
            success: boolean;
            data: PayrollListItem;
            error?: string;
        }>(`${ApiRoutes.user}GetUserPayRollDetail`, {
            params: params,
        });
    }

    saveUserPayrollData(config: PayrollItemConfig) {
        const formattedFilters: PayrollItemConfig = {
            userPayRollId: config.userPayRollId,
            userId: config.userId,
            companyId: config.companyId,
            locationId: config.locationId,
            startDate: config.startDate,
            arrivalDate: config.arrivalDate,
            companyEmail: config.companyEmail,
            employeeFirstDay: config.employeeFirstDay,
            employeeLastDay: config.employeeLastDay,
            isEligibleForRehire: config.isEligibleForRehire,
            isHired: config.isHired,
            payRatesList: config.payRatesList,
        };
        return this.http.post<{ success: boolean; errors: string[] }>(
            `${ApiRoutes.user}SaveUserPayroll`,
            formattedFilters
        );
    }

    getPayRateAmountByPositionId(companyId: string, positionId: number) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('positionId', positionId);
        return this.http.get<{
            success: boolean;
            data: number;
            error?: string;
        }>(`${ApiRoutes.user}GetPayRateAmountByPositionId`, {
            params: params,
        });
    }
}
