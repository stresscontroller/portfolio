import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../constants';
import { Injectable, inject } from '@angular/core';
import { CruiseEvents, DTDdockDetails } from '../../models/';
@Injectable({
    providedIn: 'root',
})
export class CruiseCalendarApiService {
    private http = inject(HttpClient);

    loadCruiseScheduleCalendar(
        companyUniqueID: string,
        startDate: string,
        endDate: string,
        portID: number | null,
        excludeCanceled: boolean
    ) {
        let params = new HttpParams();
        params = params.append('companyUniqueID', companyUniqueID);
        params = params.append('startDate', startDate);
        params = params.append('endDate', endDate);
        if (portID) {
            params = params.append('portID', portID);
        }
        params = params.append('excludeCanceled', excludeCanceled);

        return this.http.get<{
            success: boolean;
            data: CruiseEvents[];
            error?: string;
        }>(`${ApiRoutes.employee}LoadCruiseScheduleCalendar`, {
            params: params,
        });
    }

    getDTDAssignmentDockDetail(
        companyUniqueID: string,
        portID: number,
        dtdAssignmentDate: string,
        shipId: number
    ) {
        let params = new HttpParams();
        params = params.append('companyUniqueID', companyUniqueID);
        params = params.append('PortId', portID);
        params = params.append('AssignmentDate', dtdAssignmentDate);
        params = params.append('ShipId', shipId);

        return this.http.get<{
            success: boolean;
            data: DTDdockDetails;
            error?: string;
        }>(`${ApiRoutes.employee}GetDockAssignmentDetail`, { params: params });
    }

    saveDockAssignmentDetail(
        companyUniqueID: string,
        portId: number,
        assignmentDate: string,
        shipId: number,
        dockId: number
    ) {
        let params = new HttpParams();
        params = params.append('companyUniqueID', companyUniqueID);
        params = params.append('PortId', portId);
        params = params.append('AssignmentDate', assignmentDate);
        params = params.append('ShipId', shipId);
        params = params.append('DockId', dockId);

        return this.http.post<{
            success: boolean;
            data: string;
            error?: string;
        }>(`${ApiRoutes.employee}SaveDockAssignmentDetail`, null, {
            params: params,
        });
    }
}
