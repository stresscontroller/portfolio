import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../../constants';
import {
    Department,
    DepartmentPosition,
    LocationData,
    PositionDetails,
    UserCertificationsData,
    UserDetails,
    UserDetailsConfig,
    UserListConfig,
    UserListItem,
    UserNoteConfig,
    UserNotesListItem,
    UserRoles,
    CommunicationsConfig,
    UserListItemWithDepartmentsPositions,
    CompanyPositionListItem,
} from '@app/core';

@Injectable({
    providedIn: 'root',
})
export class UserManagementApiService {
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

    getUsersWithPositionData(companyUniqueID: string) {
        let params = new HttpParams();
        params = params.append('companyUniqueID', companyUniqueID);
        return this.http.post<{
            success: boolean;
            data: UserListItemWithDepartmentsPositions[];
            error?: string;
        }>(`${ApiRoutes.user}GetUsersWithPositionData`, undefined, {
            params: params,
        });
    }

    getCompanyPositions(companyUniqueID: string) {
        let params = new HttpParams();
        params = params.append('companyUniqueID', companyUniqueID);
        return this.http.post<{
            success: boolean;
            data: CompanyPositionListItem[];
            error?: string;
        }>(`${ApiRoutes.user}GetCompanyPositions`, undefined, {
            params: params,
        });
    }

    getUserDetail(userId: string) {
        let params = new HttpParams();
        params = params.append('userId', userId);
        return this.http.get<{
            success: boolean;
            data: UserDetails;
            error?: string;
        }>(`${ApiRoutes.user}GetUserDetail`, { params });
    }

    saveUserDetail(config: UserDetailsConfig) {
        return this.http.post<{
            success: boolean;
            data: UserListItem[];
            error?: string;
        }>(`${ApiRoutes.user}SaveUserDetail`, config);
    }

    saveUserProfilePhoto(formData: FormData) {
        return this.http.post<{
            success: boolean;
            data: [];
            error?: string;
        }>(`${ApiRoutes.user}SaveUserProfilePhoto`, formData);
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

    loadLocationType(companyID: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        return this.http.get<{
            success: boolean;
            data: string[];
            errors?: string[];
        }>(`${ApiRoutes.user}LoadLocationType`, {
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

    loadLocationDataByType(companyID: string, locationType: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        params = params.append('locationType', locationType);
        return this.http.get<{
            success: boolean;
            data: LocationData[];
            error?: string;
        }>(`${ApiRoutes.user}LoadLocationDataByType`, {
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

    loadCompanyDepartments(companyID: string) {
        let params = new HttpParams();
        params = params.append('companyUniqueId', companyID);
        return this.http.post<{
            success: boolean;
            data: Department[];
            error?: string;
        }>(`${ApiRoutes.user}GetCompanyDepartments`, undefined, {
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

    getUserRoleList(companyID: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        return this.http.get<{
            success: boolean;
            data: UserRoles[];
            error?: string;
        }>(`${ApiRoutes.user}GetUserRoleList`, {
            params: params,
        });
    }

    saveQualification(formData: FormData) {
        return this.http.post<{
            success: boolean;
            data: number;
            errors?: string;
        }>(`${ApiRoutes.user}SaveQualification`, formData);
    }

    loadUserQualificationData(companyID: string, userId: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        params = params.append('userId', userId);
        params = params.append('tabName', 'certification');
        return this.http.get<{
            success: boolean;
            data: UserCertificationsData[];
            error?: string;
        }>(`${ApiRoutes.user}LoadUserQualificationData`, {
            params: params,
        });
    }

    deleteQualification(UserQualificationLicenseId: number) {
        let params = new HttpParams();
        params = params.append(
            'UserQualificationLicenseId',
            UserQualificationLicenseId
        );
        return this.http.post<{
            success: boolean;
            data: number;
            error?: string;
        }>(`${ApiRoutes.user}DeleteQualification`, undefined, {
            params: params,
        });
    }

    sendMessage(data: CommunicationsConfig) {
        let params = new HttpParams();
        params = params.append('subject', data.subject);
        params = params.append('message', data.message);
        params = params.append('isBodyHtml', data.isBodyHtml);
        return this.http.post<{
            success: boolean;
            data: number;
            error?: string;
        }>(`${ApiRoutes.email}SendBulkHtmlEmail`, data.to, {
            params: params,
        });
    }
}
