import { Injectable, inject } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import {
    EventType,
    InteractionStatus,
    InteractionType,
    SsoSilentRequest,
    AuthenticationResult,
    AuthorizationCodeRequest,
} from '@azure/msal-browser';
import { AccountInfo, IdTokenClaims } from '@azure/msal-common';
import {
    BehaviorSubject,
    catchError,
    combineLatest,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    of,
    shareReplay,
    tap,
} from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { b2cPolicies, roles } from '../../configs/auth.config';
import { ApiRoutes, debounceTimes } from '../../constants';
import { AspNetUserAlt } from '../../models';
import { UIState } from '../../state';
import { StorageService } from '../storage.service';

export interface Account extends AccountInfo {
    idTokenClaims?: {
        [roles: string]: unknown;
    };
}

type IdTokenClaimsWithPolicyId = IdTokenClaims & {
    acr?: string;
    tfp?: string;
};

@Injectable({
    providedIn: 'root',
})
export class AuthServiceCommon {
    router = inject(Router);
    msalService = inject(MsalService);
    msalBroadcastService = inject(MsalBroadcastService);
    http = inject(HttpClient);
    uiState = inject(UIState);
    storageService = inject(StorageService);

    msalEvents$ = this.msalBroadcastService.msalSubject$.pipe(
        distinctUntilChanged((prev, curr) => prev.eventType === curr.eventType)
    );

    authInProgress$ = this.msalBroadcastService.inProgress$.pipe(
        map((status) => status !== InteractionStatus.None),
        shareReplay()
    );
    user$ = new BehaviorSubject<Account | undefined>(undefined);
    isAdmin$ = this.user$.pipe(
        map(() => {
            return this.hasPermission({
                data: { expectedRole: [roles.Developer, roles.Admin] },
            });
        })
    );
    isAgent$ = this.user$.pipe(
        map(() => {
            return this.hasPermission({
                data: { expectedRole: [roles.Agent] },
            });
        })
    );
    isUser$ = this.user$.pipe(
        map(() => {
            return this.hasPermission({
                data: { expectedRole: [roles.User] },
            });
        })
    );
    isInhouseAgent$ = this.user$.pipe(
        map(() => {
            return this.hasPermission({
                data: { expectedRole: [roles.Employee, roles.Agent] },
            });
        })
    );

    interactionStatus = InteractionStatus;

    /**
     * Call this function with expectedRoles that looks something like this:
     * {data: { expectedRole: [roles.Admin, roles.Affiliate]}}
     *
     * If you want to override the roles and return true if the user has one of a set of roles pass the expected roles like so
     * {data: { expectedRole: [roles.Admin, roles.Affiliate], overrideRole: [roles.SuperAdmin, <insert more roles ...>]}}
     *
     * you can also pass true for alert if you wish to alert the user that they don't have the proper roles
     *
     * Note that you must also include the roles from the auth config using relative pathing:
     * import { roles } from './auth-config';
     */
    hasPermission(expectedRoles: {
        data: { expectedRole?: string[]; overrideRole?: string[] };
    }) {
        const expectedRole = expectedRoles.data['expectedRole'] as string[];
        const overrideRole = expectedRoles.data['overrideRole'] as string[];
        const account = this.getAccount();
        let overrideRoleMatch = false;
        let expectedRoleMatch = false;

        // Override role check here
        if (overrideRole != undefined) {
            overrideRole.forEach((role) => {
                if (account?.idTokenClaims?.[role]) {
                    overrideRoleMatch = true;
                } else if (role === roles.User) {
                    // workaround for missing idTokenClaims when logging in via ropcFirstTimeCheckout flow
                    overrideRoleMatch =
                        account?.idTokenClaims?.['tfp'] ===
                        'B2C_1_SignInROPCFirstTimeCheckout';
                }
            });
        }
        if (overrideRoleMatch) {
            return true;
        }

        // Expected role check here
        if (expectedRole != undefined) {
            expectedRole.forEach((role) => {
                if (account?.idTokenClaims?.[role]) {
                    expectedRoleMatch = true;
                } else if (role === roles.User) {
                    // workaround for missing idTokenClaims when logging in via ropcFirstTimeCheckout flow
                    expectedRoleMatch =
                        account?.idTokenClaims?.['tfp'] ===
                        'B2C_1_SignInROPCFirstTimeCheckout';
                }
            });
        }
        if (expectedRoleMatch) {
            return true;
        }

        return false;
    }

    isLoggedIn(): boolean {
        return this.getAccount() != undefined;
    }

    isAgent(): boolean {
        return this.hasPermission({
            data: { expectedRole: [roles.Agent] },
        });
    }

    isInHouseAgent(): boolean {
        return this.hasPermission({
            data: { expectedRole: [roles.InhouseAgent] },
        });
    }

    getAccount(): Account | undefined {
        const account = {
            ...this.user$.getValue(),
            ...this.msalService.instance.getAllAccounts()?.[0],
        };
        if (Object.keys(account).length === 0) {
            return undefined;
        }
        return account;
    }

    getUserId(): string | null {
        const account = this.msalService.instance.getAllAccounts()[0];
        if (account?.idTokenClaims?.['extension_CruiseCodeUserId']) {
            const result: string = account?.idTokenClaims?.[
                'extension_CruiseCodeUserId'
            ] as string;
            return result;
        } else {
            return null;
        }
    }

    listenersInitialized = false;
    initListeners(): void {
        if (this.listenersInitialized) {
            return;
        }
        this.checkAndSetActiveAccount();
        this.listenersInitialized = true;
        this.msalService.instance.enableAccountStorageEvents(); // Optional - This will enable ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window

        // required for standalone projects
        this.msalService
            .handleRedirectObservable()
            .pipe(
                // prevent throwing a bad error to the app
                catchError((error) => {
                    console.log('[Azure Error]:', error);
                    return of({});
                })
            )
            .subscribe();

        /**
         * You can subscribe to MSAL events as shown below. For more info,
         * visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/events.md
         */
        combineLatest([
            this.msalBroadcastService.msalSubject$.pipe(
                filter(
                    (msg) =>
                        msg.eventType === EventType.ACCOUNT_ADDED ||
                        msg.eventType === EventType.ACCOUNT_REMOVED
                ),
                tap(() => {
                    if (
                        this.msalService.instance.getAllAccounts().length === 0
                    ) {
                        // redirect to root
                        this.logout();
                    }
                })
            ),
            // Acquire Token By Code Success
            this.msalBroadcastService.msalSubject$.pipe(
                filter(
                    (msg) =>
                        msg.eventType ===
                        EventType.ACQUIRE_TOKEN_BY_CODE_SUCCESS
                )
            ),
            this.msalBroadcastService.inProgress$.pipe(
                filter(
                    (status: InteractionStatus) =>
                        status === InteractionStatus.None
                )
            ),
        ])
            .pipe(debounceTime(debounceTimes.apiDebounce))
            .subscribe(() => {
                this.checkAndSetActiveAccount();
            });

        // Login Success / Token Success
        this.msalBroadcastService.msalSubject$
            .pipe(
                filter(
                    (msg) =>
                        msg.eventType === EventType.LOGIN_SUCCESS ||
                        msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
                        msg.eventType === EventType.SSO_SILENT_SUCCESS
                ),
                distinctUntilChanged(
                    (prev, curr) => prev.eventType === curr.eventType
                )
            )
            .subscribe((result) => {
                const payload = result.payload as AuthenticationResult;
                if (payload) {
                    const idtoken =
                        payload.idTokenClaims as IdTokenClaimsWithPolicyId;

                    if (
                        idtoken.acr === b2cPolicies.names.signUpSignIn ||
                        idtoken.tfp === b2cPolicies.names.signUpSignIn
                    ) {
                        this.msalService.instance.setActiveAccount(
                            payload.account
                        );
                        this.checkAndSetActiveAccount();
                    }

                    /**
                     * For the purpose of setting an active account for UI update, we want to consider only the auth response resulting
                     * from SUSI flow. "acr" claim in the id token tells us the policy (NOTE: newer policies may use the "tfp" claim instead).
                     * To learn more about B2C tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
                     */
                    if (
                        idtoken.acr === b2cPolicies.names.editProfile ||
                        idtoken.tfp === b2cPolicies.names.editProfile
                    ) {
                        // retrieve the account from initial sing-in to the app
                        const originalSignInAccount = this.msalService.instance
                            .getAllAccounts()
                            .find(
                                (account: AccountInfo) =>
                                    account.idTokenClaims?.oid ===
                                        idtoken.oid &&
                                    account.idTokenClaims?.sub ===
                                        idtoken.sub &&
                                    ((
                                        account.idTokenClaims as IdTokenClaimsWithPolicyId
                                    ).acr === b2cPolicies.names.signUpSignIn ||
                                        (
                                            account.idTokenClaims as IdTokenClaimsWithPolicyId
                                        ).tfp ===
                                            b2cPolicies.names.signUpSignIn)
                            );

                        const signUpSignInFlowRequest: SsoSilentRequest = {
                            authority:
                                b2cPolicies.authorities.signUpSignIn.authority,
                            account: originalSignInAccount,
                        };

                        // silently login again with the signUpSignIn policy
                        this.msalService.ssoSilent(signUpSignInFlowRequest);
                    }

                    /**
                     * Below we are checking if the user is returning from the reset password flow.
                     * If so, we will ask the user to reauthenticate with their new password.
                     * If you do not want this behavior and prefer your users to stay signed in instead,
                     * you can replace the code below with the same pattern used for handling the return from
                     * profile edit flow (see above ln. 74-92).
                     */
                    if (
                        idtoken.acr === b2cPolicies.names.resetPassword ||
                        idtoken.tfp === b2cPolicies.names.resetPassword
                    ) {
                        this.storageService.setItem('skipLoginSuccess', 'true');
                        this.msalService.logout();
                    }
                }

                if (
                    this.storageService.getItem('skipLoginSuccess') == null &&
                    result.eventType === EventType.LOGIN_SUCCESS
                ) {
                    this.router.navigate(['/']);
                }
                return result;
            });

        // Login Failure / Token Acquire Failure
        this.msalBroadcastService.msalSubject$
            .pipe(
                filter(
                    (msg) =>
                        msg.eventType === EventType.LOGIN_FAILURE ||
                        msg.eventType === EventType.ACQUIRE_TOKEN_FAILURE
                )
            )
            .subscribe((result) => {
                this.storageService.removeItem('skipLoginSuccess');
                // When the user fails to acquire a token silently, cached old token,
                // clear the cache and redirect to the home page
                // Checking for the forgot password error. Learn more about B2C error codes at
                // https://learn.microsoft.com/azure/active-directory-b2c/error-codes
                if (
                    result.error &&
                    result.error.message.indexOf('AADB2C90118') > -1
                ) {
                    this.resetPassword();
                }

                // When the user fails to acquire a token silently, cached old token, clear the cache and redirect to the home page
                if (
                    result.eventType === EventType.ACQUIRE_TOKEN_FAILURE &&
                    result.interactionType === InteractionType.Silent
                ) {
                    this.logout();
                }
                this.logout();
            });
    }

    getAspNetUser() {
        const params = new HttpParams();
        return this.http.get<{
            success: boolean;
            data: AspNetUserAlt;
            error?: string;
        }>(`${ApiRoutes.aspNetUser}GetAspNetUser`, { params: params });
    }

    getAspNetUserByEmail(email: string) {
        let params = new HttpParams();
        params = params.append('email', email);
        return this.http.get<{
            success: boolean;
            data: AspNetUserAlt;
            error?: string;
        }>(`${ApiRoutes.aspNetUser}GetAspNetUserByEmail`, { params: params });
    }

    login(): Promise<void> {
        return Promise.resolve();
    }

    resetPassword(): Promise<void> {
        return Promise.resolve();
    }

    logout(): Promise<void> {
        return Promise.resolve();
    }

    protected setActiveAcountByToken(authRequest: AuthorizationCodeRequest) {
        this.msalService.instance.acquireTokenByCode(authRequest).then(() => {
            this.user$.next(this.getAccount());
        });
    }

    protected checkAndSetActiveAccount() {
        /**
         * If no active account set but there are accounts signed in, sets first account to active account
         * To use active account set here, subscribe to inProgress$ first in your component
         * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
         */
        const activeAccount = this.msalService.instance.getActiveAccount();
        if (
            !activeAccount &&
            this.msalService.instance.getAllAccounts().length > 0
        ) {
            const accounts = this.msalService.instance.getAllAccounts();
            // add your code for handling multiple accounts here
            this.msalService.instance.setActiveAccount(accounts[0]);
        }

        const currentUser = JSON.stringify(this.user$.getValue());
        const account = this.getAccount();
        const currentAuthUser = JSON.stringify(account);
        const isLoggedIn = this.isLoggedIn();
        if (isLoggedIn) {
            if (currentUser != currentAuthUser) {
                this.user$.next(account);
            }
        } else {
            this.user$.next(undefined);
        }
    }
}
