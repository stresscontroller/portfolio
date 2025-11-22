import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../../constants';
import {
    UserTrainingDataItem,
    TrainingListItem,
    UserTrainingConfig,
} from '@app/core';

@Injectable({
    providedIn: 'root',
})
export class UserTrainingApiService {
    private http = inject(HttpClient);

    loadTrainingList(companyID: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        return this.http.get<{
            success: boolean;
            data: TrainingListItem[];
            error?: string;
        }>(`${ApiRoutes.user}TrainingList`, {
            params: params,
        });
    }

    loadUserTrainingData(companyID: string, userId: string) {
        let params = new HttpParams();
        params = params.append('companyID', companyID);
        params = params.append('userId', userId);
        return this.http.get<{
            success: boolean;
            data: UserTrainingDataItem[];
            error?: string;
        }>(`${ApiRoutes.user}LoadUserTrainingData`, {
            params: params,
        });
    }

    saveUserTraining(config: UserTrainingConfig) {
        return this.http.post<{
            success: boolean;
            data: UserTrainingDataItem[];
            error?: string;
        }>(`${ApiRoutes.user}AddEditUserTraining`, config);
    }

    deleteUserTraining(userTrainingId: number) {
        let params = new HttpParams();
        params = params.append('UserTrainingId', userTrainingId);
        return this.http.post<{
            success: boolean;
            data: UserTrainingDataItem[];
            error?: string;
        }>(`${ApiRoutes.user}DeleteUserTraining`, undefined, {
            params: params,
        });
    }
}
