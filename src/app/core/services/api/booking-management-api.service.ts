import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '@app/core';
import {
    CruiseLineListItem,
    CruiseLineDetails,
    CruiseShipListItem,
    UpcomingShipScheduleConfig,
    CruiseShipDetails,
    UpcomingShipScheduleListItem,
    CruiseShipConfig,
    CruiseShipScheduleConfig,
    CruiseShipScheduleListItem,
    CruiseLineTourListItem,
    CruiseLineTourConfig,
    CruiseLineTourNameCodeConfig,
    TourServiceListItem,
} from '../../models';

@Injectable({
    providedIn: 'root',
})
export class BookingManagementApiService {
    private http = inject(HttpClient);

    loadCruiseLineList(companyId: string, isShowInActive: boolean = false) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('isShowInActive', String(isShowInActive));
        return this.http.get<{
            success: boolean;
            data: CruiseLineListItem[];
            error?: string;
        }>(`${ApiRoutes.cruiseLine}GetCruiseLineList`, { params: params });
    }

    loadCruiseLineDetails(shipCompanyId: number) {
        let params = new HttpParams();
        params = params.append('shipCompanyId', shipCompanyId);
        return this.http.get<{
            success: boolean;
            data: CruiseLineDetails;
            error?: string;
        }>(`${ApiRoutes.cruiseLine}GetCruiseLineDetail`, { params: params });
    }

    loadTourServiceList(companyId: string, shipCompanyId: number) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('shipCompanyId', shipCompanyId);
        return this.http.get<{
            success: boolean;
            data: TourServiceListItem[];
            error?: string;
        }>(`${ApiRoutes.cruiseLine}GetCruiseLineTourList`, { params: params });
    }

    saveCruiseLine(config: FormData) {
        return this.http.post<{
            success: boolean;
            data: CruiseLineListItem[];
            errors?: string;
        }>(`${ApiRoutes.cruiseLine}SaveCruiseLine`, config);
    }

    loadCruiseLineTourList(companyId: string, shipCompanyId: number) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('shipCompanyId', shipCompanyId);
        return this.http.get<{
            success: boolean;
            data: CruiseLineTourListItem[];
            error?: string;
        }>(`${ApiRoutes.cruiseLine}GetCruiseLineTourList`, { params: params });
    }

    updateCruiseLineTour_Code(config: CruiseLineTourNameCodeConfig) {
        return this.http.post<{
            success: boolean;
            data: CruiseLineTourListItem[];
            errors?: string;
        }>(`${ApiRoutes.cruiseLine}UpdateCruiseLineTourName_Code`, config);
    }

    updateCruiseLineTour(config: CruiseLineTourConfig) {
        return this.http.post<{
            success: boolean;
            data: CruiseLineTourListItem[];
            errors?: string;
        }>(`${ApiRoutes.cruiseLine}UpdateCruiseLineTourRates`, config);
    }

    deleteCruiseLine(id: number, isActive: boolean) {
        const config = {
            id: id,
            isActive: isActive,
        };
        return this.http.post<{
            success: boolean;
            data: CruiseLineListItem[];
            errors?: string;
        }>(`${ApiRoutes.cruiseLine}DeleteCruiseLine`, config);
    }

    loadCruiseShipList(
        companyId: string,
        isShowInActive: boolean = false,
        shipCompanyId: number = 0
    ) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('isShowInActive', String(isShowInActive));
        params = params.append('shipCompanyId', shipCompanyId);
        return this.http.get<{
            success: boolean;
            data: CruiseShipListItem[];
            error?: string;
        }>(`${ApiRoutes.cruiseLine}GetShipList`, { params: params });
    }

    loadUpcomingShipScheduleList(config: UpcomingShipScheduleConfig) {
        return this.http.post<{
            success: boolean;
            data: UpcomingShipScheduleListItem[];
            error?: string;
        }>(`${ApiRoutes.cruiseLine}GetUpcomingShipScheduleList`, config);
    }

    loadCruiseShipDetails(shipId: number) {
        let params = new HttpParams();
        params = params.append('shipId', shipId);
        return this.http.get<{
            success: boolean;
            data: CruiseShipDetails;
            error?: string;
        }>(`${ApiRoutes.cruiseLine}GetShipDetail`, { params: params });
    }

    saveCruiseShip(config: CruiseShipConfig) {
        return this.http.post<{
            success: boolean;
            data: CruiseShipListItem[];
            errors?: string;
        }>(`${ApiRoutes.cruiseLine}SaveCruiseShip`, config);
    }

    deleteCruiseShip(id: number, isActive: boolean) {
        const config = {
            id: id,
            isActive: isActive,
        };
        return this.http.post<{
            success: boolean;
            data: CruiseLineListItem[];
            errors?: string;
        }>(`${ApiRoutes.cruiseLine}DeleteCruiseShip`, config);
    }

    loadShipScheduleList(
        shipCompanyId: number,
        companyId: string,
        startDate: string,
        endDate: string
    ) {
        const config = {
            companyId: companyId,
            shipCompanyId: shipCompanyId,
            startDate: startDate,
            endDate: endDate,
        };
        return this.http.post<{
            success: boolean;
            data: CruiseShipScheduleListItem[];
            error?: string;
        }>(
            `${ApiRoutes.cruiseLine}GetCruiseLineShipScheduleList_Dates`,
            config
        );
    }

    loadLineShipScheduleList(companyId: string, shipCompanyId: number) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('shipCompanyId', shipCompanyId);
        return this.http.get<{
            success: boolean;
            data: CruiseShipScheduleListItem[];
            error?: string;
        }>(`${ApiRoutes.cruiseLine}GetCruiseLineShipScheduleList`, {
            params: params,
        });
    }

    saveShipSchedule(config: CruiseShipScheduleConfig) {
        return this.http.post<{
            success: boolean;
            data: UpcomingShipScheduleListItem[];
            errors?: string;
        }>(`${ApiRoutes.cruiseLine}SaveShipSchedule`, config);
    }

    deleteShipSchedule(id: number, isActive: boolean) {
        const config = {
            id: id,
            isActive: isActive,
        };
        return this.http.post<{
            success: boolean;
            data: CruiseLineListItem[];
            errors?: string;
        }>(`${ApiRoutes.cruiseLine}DeleteCruiseShip`, config);
    }
}
