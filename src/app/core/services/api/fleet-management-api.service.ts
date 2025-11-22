import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '@app/core';
import {
    EquipmentTypeFieldListItem,
    EquipmentTypeListItem,
    EquipmentTypeDetailItem,
    EquipmentTypeConfig,
    EquipmentConfig,
    EquipmentDetail,
    EquipmentListItem,
} from '../../models';

@Injectable({
    providedIn: 'root',
})
export class FleetManagementApiService {
    private http = inject(HttpClient);

    loadEquipmentTypeFieldList() {
        return this.http.get<{
            success: boolean;
            data: EquipmentTypeFieldListItem[];
            error?: string;
        }>(`${ApiRoutes.admin}GetEquipmentTypeFieldList`);
    }

    loadEquipmentTypeList(companyId: string, isShowInActive: boolean) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('isShowInActive', String(isShowInActive));
        return this.http.get<{
            success: boolean;
            data: EquipmentTypeListItem[];
            error?: string;
        }>(`${ApiRoutes.admin}GetEquipmentTypeList`, { params: params });
    }

    loadEquipmentTypeDetail(equipmentTypeId: number) {
        let params = new HttpParams();
        params = params.append('equipmentTypeId', equipmentTypeId);
        return this.http.get<{
            success: boolean;
            data: EquipmentTypeDetailItem;
            error?: string;
        }>(`${ApiRoutes.admin}GetEquipmentTypeDetail`, { params: params });
    }

    saveEquipmentType(config: EquipmentTypeConfig) {
        return this.http.post<{
            success: boolean;
            data: EquipmentTypeListItem[];
            error?: string;
        }>(`${ApiRoutes.admin}SaveEquipmentType`, config);
    }

    deleteEquipmentType(id: number, isActive: boolean) {
        const config = {
            equipmentTypeID: id,
            isActive: isActive,
        };
        return this.http.post<{
            success: boolean;
            data: EquipmentTypeListItem[];
            error?: string;
        }>(`${ApiRoutes.admin}DeleteEquipmentType`, config);
    }

    loadEquipmentList(companyId: string, includeInactive: boolean = false) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('includeInactive', includeInactive.toString());
        return this.http.get<{
            success: boolean;
            data: EquipmentListItem[];
            error?: string;
        }>(`${ApiRoutes.dtd}GetEquipmentList`, { params: params });
    }

    saveEquipment(config: EquipmentConfig) {
        return this.http.post<{
            success: boolean;
            data: EquipmentListItem[];
            error?: string;
        }>(`${ApiRoutes.admin}SaveEquipment`, config);
    }

    deleteEquipment(equipmentID: number, isActive: boolean) {
        const config = {
            equipmentID: equipmentID,
            isActive: isActive,
        };
        return this.http.post<{
            success: boolean;
            data: EquipmentListItem[];
            error?: string;
        }>(`${ApiRoutes.admin}DeleteEquipment`, config);
    }

    loadEquipmentDetail(equipmentID: string) {
        let params = new HttpParams();
        params = params.append('equipmentID', equipmentID);
        return this.http.get<{
            success: boolean;
            data: EquipmentDetail;
            error?: string;
        }>(`${ApiRoutes.admin}GetEquipmentDetail`, { params: params });
    }
}
