import { Injectable, inject } from '@angular/core';
import {
    AgentUser,
    ApiEquipmentItem,
    AppGuide,
    AppPickupLocation,
    Docks,
    Port,
    Ship,
    ShipCompany,
    Tour,
} from '../../models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../constants';

@Injectable({
    providedIn: 'root',
})
export class FiltersApiService {
    private http = inject(HttpClient);

    getGuides(companyUniqueId: string, includeInactiveUsers = false) {
        let params = new HttpParams();
        params = params.append('companyUniqueId', companyUniqueId);
        params = params.append('includeInactiveUsers', includeInactiveUsers);
        return this.http.get<{
            success: boolean;
            data: AppGuide[];
            error?: string;
        }>(`${ApiRoutes.dtd}GetGuides`, {
            params: params,
        });
    }

    getEquipmentList(companyId: string) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        return this.http.get<{
            success: boolean;
            data: ApiEquipmentItem[];
            error?: string;
        }>(`${ApiRoutes.dtd}GetEquipmentList`, { params: params });
    }

    getDocks(companyUniqueId: string) {
        let params = new HttpParams();
        params = params.append('cuid', companyUniqueId);

        return this.http.get<{
            success: boolean;
            data: Docks[];
            error?: string;
        }>(`${ApiRoutes.employee}GetDocks`, { params: params });
    }

    getTours(companyUniqueId: string) {
        let params = new HttpParams();
        params = params.append('cuid', companyUniqueId);

        return this.http.get<{
            success: boolean;
            data: Tour[];
            error?: string;
        }>(`${ApiRoutes.dtd}GetTourManagementList`, { params: params });
    }

    getShipCompanyList(isBookDirectIncluded?: boolean) {
        let params = new HttpParams();
        if (isBookDirectIncluded) {
            params = params.append(
                'isBookDirectIncluded',
                isBookDirectIncluded
            );
        }
        return this.http.get<{
            success: boolean;
            data: ShipCompany[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetShipCompanyList`, { params: params });
    }

    getShipListByCompany(companyId: number) {
        let params = new HttpParams();
        params = params.append('ShipCompanyId', companyId);
        return this.http.get<{
            success: boolean;
            data: Ship[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetShipListByShipCompanyId`, {
            params: params,
        });
    }

    getPorts(companyUniqueId: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyUniqueId);
        return this.http.get<{
            success: boolean;
            data: Port[];
            error?: string;
        }>(`${ApiRoutes.dtd}LoadCruisePortData`, { params: params });
    }

    getAgentUsers(companyUniqueId: string) {
        let params = new HttpParams();
        params = params.append('companyUniqueId', companyUniqueId);
        params = params.append('isActive', true);
        return this.http.get<{
            success: boolean;
            data: AgentUser[];
            error?: string;
        }>(`${ApiRoutes.dtd}GetAgentsList`, { params: params });
    }

    getPickupLocations(tourInventoryId: number, isArrivingByCruise: boolean) {
        let params = new HttpParams();
        params = params.append('tourInventoryId', tourInventoryId);
        params = params.append('isArrivingByCruise', isArrivingByCruise);
        return this.http.get<{
            success: boolean;
            data: AppPickupLocation[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetPickUpLocationList`, {
            params: params,
        });
    }
}
