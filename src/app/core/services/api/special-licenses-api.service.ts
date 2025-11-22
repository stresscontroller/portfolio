import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../constants';
import { SpecialLicensesListItem, SpecialLicensesConfig } from '@app/core';

@Injectable({
    providedIn: 'root',
})
export class SpecialLicensesApiService {
    private http = inject(HttpClient);

    loadSpecialLicenses(companyID: string, userId: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        params = params.append('userId', userId);
        return this.http.get<{
            success: boolean;
            data: SpecialLicensesListItem[];
            error?: string;
        }>(`${ApiRoutes.user}LoadSpecialLicenseData`, {
            params: params,
        });
    }

    // loadSpecialLicenses1(companyID: string, userId: string) {
    //     let params = new HttpParams();
    //     params = params.append('companyID', companyID);
    //     params = params.append('userId', userId);
    //     params = params.append('tabName', 'license');
    //     return this.http.get<{
    //         success: boolean;
    //         data: UserCertificationsData[];
    //         error?: string;
    //     }>(`${ApiRoutes.user}LoadUserQualificationData`, {
    //         params: params,
    //     });
    // }

    saveSpecialLicenses1(formData: FormData) {
        return this.http.post<{
            success: boolean;
            data: number;
            errors?: string;
        }>(`${ApiRoutes.user}SaveQualification`, formData);
    }

    saveSpecialLicenses(config: SpecialLicensesConfig) {
        const formData: FormData = new FormData();
        formData.append('FormFile', config.documentFile);
        formData.append(
            'SpecialLicenseCoachingId',
            config.userEvaluationCoachingId.toString()
        );
        formData.append('UserId', config.userId);
        formData.append('CompanyUniqueId', config.companyId);
        formData.append('FormPath', config.formPath);
        formData.append('IsActive', config.isActive.toString());
        formData.append('FormDate', config.fromDate);
        formData.append('Type', config.type);
        formData.append('SpecialLicenseName', config.specialLicenseName);

        return this.http.post<{
            success: boolean;
            data: SpecialLicensesListItem[];
            error?: string;
        }>(`${ApiRoutes.user}SaveSpecialLicense`, formData);
    }

    deleteSpecialLicense(config: SpecialLicensesListItem) {
        let params = new HttpParams();
        params = params.append(
            'userTrainingId',
            config.userEvaluationCoachingId
        );
        return this.http.post<{
            success: boolean;
            data: SpecialLicensesListItem[];
            error?: string;
        }>(`${ApiRoutes.user}DeleteSpecialLicense`, undefined, {
            params: params,
        });
    }
}
