import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiRoutes } from '../../constants';
import { Feature } from '../../models';

@Injectable({
    providedIn: 'root',
})
export class FeatureFlagApiService {
    private http = inject(HttpClient);
    getGlobalFeatureOverview() {
        return this.http.get<{
            success: boolean;
            data: Feature[];
            error?: string;
        }>(`${ApiRoutes.cruiseCodeFeature}GetGlobalFeatureOverview`);
    }
}
