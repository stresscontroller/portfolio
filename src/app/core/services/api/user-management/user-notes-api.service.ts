import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../../constants';
import {
    Department,
    DepartmentPosition,
    LocationData,
    PositionDetails,
    UserListConfig,
    UserListItem,
    UserNoteConfig,
    UserNotesListItem,
} from '@app/core';

@Injectable({
    providedIn: 'root',
})
export class UserNotesApiService {
    private http = inject(HttpClient);

    getUserNotesList(userId: string) {
        let params = new HttpParams();
        params = params.append('userId', userId);
        return this.http.get<{
            success: boolean;
            data: UserNotesListItem[];
            error?: string;
        }>(`${ApiRoutes.user}GetUserNotesList`, {
            params: params,
        });
    }

    getUserList(config: UserListConfig) {
        return this.http.post<{
            success: boolean;
            data: UserListItem[];
            error?: string;
        }>(`${ApiRoutes.user}GetUserList`, config);
    }

    saveUserNotes(config: UserNoteConfig) {
        return this.http.post<{
            success: boolean;
            data: UserListItem[];
            error?: string;
        }>(`${ApiRoutes.user}SaveUserNote`, config);
    }

    deleteUserNote(userNoteId: number) {
        let params = new HttpParams();
        params = params.append('userNoteId', userNoteId);
        return this.http.post<{
            success: boolean;
            data: UserListItem[];
            error?: string;
        }>(`${ApiRoutes.user}DeleteUserNote`, undefined, {
            params: params,
        });
    }

    loadLocationData(companyID: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        return this.http.get<{
            success: boolean;
            data: LocationData[];
            error?: string;
        }>(`${ApiRoutes.user}LoadLocationData`, {
            params: params,
        });
    }

    loadDepartmentsForCompany(companyID: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        return this.http.get<{
            success: boolean;
            data: Department[];
            error?: string;
        }>(`${ApiRoutes.user}LoadDepartmentsForCompany`, {
            params: params,
        });
    }

    loadPositionsForDepartment(companyID: string, departmentId: number) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        params = params.append('departmentId', departmentId);
        return this.http.get<{
            success: boolean;
            data: DepartmentPosition[];
            error?: string;
        }>(`${ApiRoutes.user}LoadPositionsForDepartment`, {
            params: params,
        });
    }

    getPositionDetail(companyID: string, departmentId: number) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        params = params.append('departmentId', departmentId);
        return this.http.get<{
            success: boolean;
            data: PositionDetails[];
            error?: string;
        }>(`${ApiRoutes.user}GetPositionDetail`, {
            params: params,
        });
    }
}
