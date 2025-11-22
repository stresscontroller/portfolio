import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../../constants';
import {
    UserEvaluationsListItem,
    UserEvaluationsConfig,
    Qualification,
} from '@app/core';

@Injectable({
    providedIn: 'root',
})
export class UserEvaluationsApiService {
    private http = inject(HttpClient);

    loadUserEvaluations(companyID: string, userId: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        params = params.append('userId', userId);
        return this.http.get<{
            success: boolean;
            data: UserEvaluationsListItem[];
            error?: string;
        }>(`${ApiRoutes.user}LoadUserEvaluationCoachingData`, {
            params: params,
        });
    }

    saveUserEvaluations(config: UserEvaluationsConfig) {
        const formData: FormData = new FormData();
        if (config.formFile) {
            formData.append('FormFile', config.formFile);
        }
        formData.append(
            'UserEvaluationCoachingId',
            config.userEvaluationCoachingId.toString()
        );
        formData.append('UserId', config.userId);
        formData.append('CompanyUniqueId', config.companyId);
        formData.append('FormPath', config.formPath);
        formData.append('IsActive', config.isActive.toString());
        formData.append('FormDate', config.fromDate);
        formData.append('Type', config.type);

        return this.http.post<{
            success: boolean;
            data: UserEvaluationsListItem[];
            error?: string;
        }>(`${ApiRoutes.user}AddEditUserEvaluationCoaching`, formData);
    }

    deleteUserEvaluation(config: UserEvaluationsListItem) {
        let params = new HttpParams();
        params = params.append(
            'userTrainingId',
            config.userEvaluationCoachingId
        );
        return this.http.post<{
            success: boolean;
            data: UserEvaluationsListItem[];
            error?: string;
        }>(`${ApiRoutes.user}DeleteUserEvaluationCoaching`, undefined, {
            params: params,
        });
    }

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
}
