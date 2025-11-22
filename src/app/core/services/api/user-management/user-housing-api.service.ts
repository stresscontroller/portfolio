import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../../constants';
import { HousingDataItem, HousingDataConfig } from '@app/core';

@Injectable({
    providedIn: 'root',
})
export class UserHousingApiService {
    private http = inject(HttpClient);

    loadUserHousingData(userId: string, companyId: string) {
        let params = new HttpParams();
        params = params.append('userId', userId);
        params = params.append('companyID', companyId);
        return this.http.get<{
            success: boolean;
            data: HousingDataItem;
            error?: string;
        }>(`${ApiRoutes.user}LoadUserHousingData`, {
            params: params,
        });
    }

    saveUserHousingData(config: HousingDataConfig) {
        const formattedFilters: Record<string, string | number | boolean> = {
            userId: config.userId,
            housingLocationName: config.housingLocationName,
            weeklyRent: config.weeklyRent,
            numPets: config.numPets,
            petDeposit: config.petDeposit,
            moveInDate: config.moveInDate,
            housingNotes: config.housingNotes,
        };

        return this.http.post<{
            success: boolean;
            data: HousingDataItem;
            error?: string;
        }>(`${ApiRoutes.user}SaveUserHousingData`, undefined, {
            params: formattedFilters,
        });
    }
}
