import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../../constants';
import {
    Qualification,
    UserQualificationListItem,
    UserQualificationConfig,
    LicenseOptions,
} from '@app/core';

@Injectable({
    providedIn: 'root',
})
export class UserQualificationsApiService {
    private http = inject(HttpClient);

    loadQualificationData(companyID: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        return this.http.get<{
            success: boolean;
            data: Qualification[];
            error?: string;
        }>(`${ApiRoutes.user}LoadQualificationData`, {
            params: params,
        });
    }

    loadLicenseOptions(companyID: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        return this.http.get<{
            success: boolean;
            data: LicenseOptions[];
            error?: string;
        }>(`${ApiRoutes.user}LoadSpecialLicenseData`, {
            params: params,
        });
    }

    loadUserQualifications(companyID: string, userId: string, tabName: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID.toUpperCase());
        params = params.append('userId', userId);
        params = params.append('tabName', tabName);
        return this.http.get<{
            success: boolean;
            data: UserQualificationListItem[];
            error?: string;
        }>(`${ApiRoutes.user}LoadUserQualificationData`, {
            params: params,
        });
    }

    saveUserQualifications(config: UserQualificationConfig) {
        const formData: FormData = new FormData();
        formData.append(
            'UserQualificationLicenseId',
            config.userQualificationLicenseId.toString()
        );
        formData.append('TypeName', config.typeName);
        formData.append('TypeId', config.typeId.toString());
        formData.append('DisplayName', config.displayName);
        formData.append('FromDate', config.fromDate);
        formData.append('ExpireDate', config.expireDate);
        formData.append(
            'IsNeverExpire',
            config.isNeverExpire ? 'true' : 'false'
        );
        formData.append('IsActive', config.isActive.toString());
        formData.append('Userid', config.userid);
        formData.append(
            'CompanyUniqueId',
            config.companyUniqueId.toUpperCase()
        );
        if (config.documentPath && config.documentFile) {
            formData.append('DocumentPath', config.documentPath);
            formData.append('DocumentFile', config.documentFile);
        }

        return this.http.post<{
            success: boolean;
            data: UserQualificationListItem[];
            error?: string;
        }>(`${ApiRoutes.user}SaveQualification`, formData);
    }

    deleteUserQualification(config: UserQualificationListItem) {
        let params = new HttpParams();
        params = params.append(
            'UserQualificationLicenseId',
            config.userQualificationLicenseId
        );
        return this.http.post<{
            success: boolean;
            data: UserQualificationListItem[];
            error?: string;
        }>(`${ApiRoutes.user}DeleteQualification`, undefined, {
            params: params,
        });
    }
}
