import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../constants';
import { ApiCreateB2CUserRequest, AspNetUser } from '../../models';
import { environment } from 'src/environments/environment';
import { B2CUser } from '../../models/b2c.model';

@Injectable({
    providedIn: 'root',
})
export class UserApiService {
    private http = inject(HttpClient);

    getAspNetUser() {
        return this.http.get<{
            success: boolean;
            data: AspNetUser;
            error?: string;
        }>(`${ApiRoutes.aspNetUser}GetAspNetUser`);
    }

    getAllUserCruiseCodeAuthRoles(userId: string) {
        let params = new HttpParams();
        params = params.append('userId', userId);

        return this.http.get<{
            success: boolean;
            data: string[];
            error?: string;
        }>(`${ApiRoutes.aspNetUser}GetAllUserCruiseCodeAuthRoles`, {
            params: params,
        });
    }

    createB2CUser(user: ApiCreateB2CUserRequest) {
        return this.http.post<{
            success: boolean;
            data: B2CUser;
            error?: string;
        }>(`${ApiRoutes.b2c}CreateB2CUser`, user);
    }

    deleteAspNetUser(userId: string, isEligibleForRehire: boolean) {
        let params = new HttpParams();
        params = params.append('UserId', userId);
        params = params.append('IsEligibleForRehire', isEligibleForRehire);

        return this.http.post<{
            success: boolean;
            data: AspNetUser;
            error?: string;
        }>(`${ApiRoutes.aspNetUser}DeleteUser`, undefined, {
            params: params,
        });
    }

    restoreAspNetUser(userId: string) {
        let params = new HttpParams();
        params = params.append('UserId', userId);

        return this.http.post<{
            success: boolean;
            data: AspNetUser;
            error?: string;
        }>(`${ApiRoutes.aspNetUser}MakeUserActive`, undefined, {
            params: params,
        });
    }

    sendForgotPasswordEmail(email: string) {
        // For now we will only have this link for resetting passwords
        const passwordResetCallbackUrl = environment.resetUserPasswordLink;
        let params = new HttpParams();
        params = params.append('email', email);
        params = params.append('callbackUrl', passwordResetCallbackUrl);

        return this.http.get<{
            success: boolean;
            data: string;
            error?: string;
        }>(`${ApiRoutes.email}SendEmail_ForgotPassword`, { params: params });
    }
}
