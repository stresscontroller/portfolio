import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import {
    ApiRoutes,
    AuthRole,
    Feature,
    Role,
    RoleBasedFeature,
    RoleLinkingFeatureInsert,
    RoleLinkingPageFeatureInsert,
    RoleLinkingPageInsert,
    toFeature,
} from '@app/core';

@Injectable({
    providedIn: 'root',
})
export class ApiPermissionsControlService {
    private http = inject(HttpClient);

    getGlobalFeatureOverview() {
        return this.http.get<{
            success: boolean;
            data: Feature[];
            error?: string;
        }>(`${ApiRoutes.cruiseCodeFeature}GetGlobalFeatureOverview`);
    }

    getAllAvailableRoles(companyId: string) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);

        return this.http.get<{
            success: boolean;
            data: Role[];
            error?: string;
        }>(`${ApiRoutes.aspNetUser}GetAspNetUserRolesForCompany`, {
            params: params,
        });
    }

    getRolePermissions(companyUniqueId: string, roleId: string) {
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

    updateInsertRoleBasedFeature(
        roleLinkingFeatureInsert: RoleLinkingFeatureInsert
    ) {
        return this.http.post<{
            success: boolean;
            data: RoleLinkingFeatureInsert;
            error?: string;
        }>(
            `${ApiRoutes.cruiseCodeFeature}UpdateInsertRoleLinkingFeature`,
            roleLinkingFeatureInsert
        );
    }

    updateInsertRoleBasedPage(roleLinkingPageInsert: RoleLinkingPageInsert) {
        return this.http.post<{
            success: boolean;
            data: RoleLinkingPageInsert;
            error?: string;
        }>(
            `${ApiRoutes.cruiseCodeFeature}UpdateInsertRoleLinkingPage`,
            roleLinkingPageInsert
        );
    }

    updateInsertRoleBasedPageFeature(
        roleLinkingPageFeatureInsert: RoleLinkingPageFeatureInsert
    ) {
        return this.http.post<{
            success: boolean;
            data: RoleLinkingPageFeatureInsert;
            error?: string;
        }>(
            `${ApiRoutes.cruiseCodeFeature}UpdateInsertRoleLinkingPageFeature`,
            roleLinkingPageFeatureInsert
        );
    }

    deleteRoleBasedFeature(roleLinkingFeatureId: string) {
        let params = new HttpParams();
        params = params.append('roleLinkingFeatureId', roleLinkingFeatureId);
        return this.http.post<{
            success: boolean;
            data: number;
            error?: string;
        }>(`${ApiRoutes.cruiseCodeFeature}DeleteRoleLinkingFeature`, '', {
            params: params,
        });
    }

    deleteRoleBasedPage(roleLinkingPageId: string) {
        let params = new HttpParams();
        params = params.append('roleLinkingPageId', roleLinkingPageId);
        return this.http.post<{
            success: boolean;
            data: number;
            error?: string;
        }>(`${ApiRoutes.cruiseCodeFeature}DeleteRoleLinkingPage`, '', {
            params: params,
        });
    }

    deleteRoleBasedPageFeature(roleLinkingPageFeatureId: string) {
        let params = new HttpParams();
        params = params.append(
            'roleLinkingPageFeatureId',
            roleLinkingPageFeatureId
        );
        return this.http.post<{
            success: boolean;
            data: number;
            error?: string;
        }>(`${ApiRoutes.cruiseCodeFeature}DeleteRoleLinkingPageFeature`, '', {
            params: params,
        });
    }

    // Roles handling

    createRole(roleName: string, companyId: string) {
        let params = new HttpParams();
        params = params.append('roleName', roleName);
        params = params.append('companyId', companyId);
        // TODO: this should ideally be a POST
        return this.http.get<{
            success: boolean;
            data: Role;
            error?: string;
        }>(`${ApiRoutes.aspNetUser}CreateAspNetUserRole`, { params });
    }

    updateRole(role: Role) {
        return this.http.post<{
            success: boolean;
            error?: string;
        }>(`${ApiRoutes.aspNetUser}UpdateAspNetUserRole`, role);
    }

    deleteRole(roleId: string) {
        let params = new HttpParams();
        params = params.append('roleId', roleId);
        // TODO: this should ideally be a POST or DELETE
        return this.http.get<{
            success: boolean;
            error?: string;
        }>(`${ApiRoutes.aspNetUser}DeleteAspNetUserRole`, { params });
    }

    copyFeatureControlsFromRole(
        companyUniqueId: string,
        roleIdToCopyFrom: string,
        roleIdToCopyTo: string
    ) {
        let params = new HttpParams();
        params = params.append('companyUniqueId', companyUniqueId);
        params = params.append('roleIdToCopyFrom', roleIdToCopyFrom);
        params = params.append('roleIdToCopyTo', roleIdToCopyTo);
        // TODO: this should ideally be a POST
        return this.http.get<{
            success: boolean;
            error?: string;
        }>(`${ApiRoutes.aspNetUser}CopyFeatureAccessFromOtherRole`, {
            params,
        });
    }

    getAuthRoles(companyUniqueId: string) {
        let params = new HttpParams();
        params = params.append('companyUniqueId', companyUniqueId);
        return this.http.get<{
            success: boolean;
            data: AuthRole[];
            error?: string;
        }>(`${ApiRoutes.aspNetUser}GetAllCruiseCodeAuthRoles`, { params });
    }

    getAuthRolesForRole(roleId: string) {
        let params = new HttpParams();
        params = params.append('aspNetUserRoleId', roleId);
        return this.http.get<{
            success: boolean;
            data: AuthRole[];
            error?: string;
        }>(`${ApiRoutes.aspNetUser}GetAllLinkedCruiseCodeAuthRoles`, {
            params,
        });
    }

    updateAuthRolesForRole(roleId: string, authRoleIds: string[]) {
        let params = new HttpParams();
        params = params.append('aspNetUserRoleId', roleId);
        return this.http.post<{
            success: boolean;
            error?: string;
        }>(
            `${ApiRoutes.aspNetUser}UpdateInsertLinkedCruiseCodeAuthRoles`,
            authRoleIds,
            {
                params,
            }
        );
    }
}
