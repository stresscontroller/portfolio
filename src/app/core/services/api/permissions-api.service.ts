import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiRoutes, RoleBasedFeature, toFeature } from '@app/core';
import { map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PermissionsApiService {
    private http = inject(HttpClient);

    getCruiseCodeFeatureByRole(companyUniqueId: string, roleId: string) {
        let params = new HttpParams();
        params = params.append('companyUniqueId', companyUniqueId);
        params = params.append('roleId', roleId);

        return this.http
            .get<{
                success: boolean;
                data: RoleBasedFeature[];
                error?: string;
            }>(`${ApiRoutes.cruiseCodeFeature}GetRoleLinkingFeatureOverview`, {
                params: params,
            })
            .pipe(map((res) => toFeature(res.data)));
    }
}
