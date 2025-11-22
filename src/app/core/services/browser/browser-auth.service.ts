import { Injectable, inject } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { lastValueFrom } from 'rxjs';
import { b2cPolicies, protectedResources } from '../../configs/auth.config';
import { AuthServiceCommon } from '../common';
import { AuthServiceBase } from '../base';

@Injectable({
    providedIn: 'root',
})
export class BrowserAuthService
    extends AuthServiceCommon
    implements AuthServiceBase
{
    msalGuardConfiguration = inject(
        MSAL_GUARD_CONFIG
    ) as unknown as MsalGuardConfiguration;

    init(): void {}

    override login(): Promise<void> {
        return lastValueFrom(
            this.msalService.loginRedirect({
                scopes: [
                    protectedResources.cruiseCodeWebApi.scopes.read[0],
                    protectedResources.cruiseCodeWebApi.scopes.write[0],
                ],
            })
        ).then(() => {
            this.checkAndSetActiveAccount();
            return Promise.resolve();
        });
    }

    override resetPassword(): Promise<void> {
        return lastValueFrom(
            this.msalService.loginRedirect({
                authority: b2cPolicies.authorities.resetPassword.authority,
                scopes: [],
            })
        ).then(() => {
            this.checkAndSetActiveAccount();
            return Promise.resolve();
        });
    }

    getAuthToken(): string | undefined {
        return undefined;
    }

    override logout(): Promise<void> {
        return lastValueFrom(this.msalService.logout()).then(() => {
            this.checkAndSetActiveAccount();
            return Promise.resolve();
        });
    }
}
