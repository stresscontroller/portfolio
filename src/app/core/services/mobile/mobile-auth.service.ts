import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthServiceCommon } from '../common';
import { AuthServiceBase } from '../base';
import {
    OAuth2AuthenticateOptions,
    OAuth2Client,
} from '@byteowls/capacitor-oauth2';
import { environment } from 'src/environments/environment';
import { SecureStorageToken } from '../../configs';
import { AuthenticationResult } from '@azure/msal-browser';
import { Account } from '../common/auth.service-common';
import { UIState } from '../../state';

@Injectable({
    providedIn: 'root',
})
export class MobileAuthService
    extends AuthServiceCommon
    implements AuthServiceBase
{
    secureStorageService = inject(SecureStorageToken);
    override uiState = inject(UIState);

    userAuth$ = new BehaviorSubject<AuthenticationResult | undefined>(
        undefined
    );

    init(): void {
        // hydrate user and userAuth observables
        this.secureStorageService.getItem('userAuth').then((savedUserAuth) => {
            if (savedUserAuth) {
                try {
                    const parsedSavedUserAuth = JSON.parse(savedUserAuth);
                    this.userAuth$.next(
                        parsedSavedUserAuth as AuthenticationResult
                    );
                } catch (err) {
                    this.userAuth$.next(undefined);
                }
            }
        });
        this.secureStorageService.getItem('userInfo').then((savedUserInfo) => {
            if (savedUserInfo) {
                try {
                    const parsedSavedUserInfo = JSON.parse(savedUserInfo);
                    this.user$.next(parsedSavedUserInfo as Account);
                } catch (err) {
                    this.user$.next(undefined);
                }
            }
        });
    }

    getAuthToken(): string | undefined {
        return this.userAuth$.getValue()?.accessToken;
    }

    override login(): Promise<void> {
        this.uiState.showLoadingIndicator();
        return OAuth2Client.authenticate(this.getAzureB2cOAuth2Options())
            .then((response) => {
                return this.msalService.instance
                    .acquireTokenByCode({
                        ...response.authorization_response.request,
                        code: response.authorization_response.code,
                    })
                    .then((result) => {
                        this.userAuth$.next(result);
                        const account = this.getAccount();
                        this.user$.next(account);

                        this.secureStorageService.setItem(
                            'userAuth',
                            JSON.stringify(result)
                        );
                        this.secureStorageService.setItem(
                            'userInfo',
                            JSON.stringify(account)
                        );
                        this.router.navigate(['/operator']).then(() => {
                            this.uiState.hideLoadingIndicator();
                        });
                        return Promise.resolve();
                    })
                    .catch((err) => {
                        if (!environment.production) {
                            console.log(err);
                        }

                        this.uiState.hideLoadingIndicator();
                    });
            })
            .catch((reason) => {
                console.error('OAuth Rejected', reason);
                this.uiState.hideLoadingIndicator();
            });
    }

    override logout(): Promise<void> {
        this.uiState.showLoadingIndicator();
        return OAuth2Client.logout(
            this.getAzureB2cOAuth2Options(),
            this.userAuth$.getValue()?.idToken
        ).then(() => {
            this.secureStorageService.clear();
            this.user$.next(undefined);
            this.userAuth$.next(undefined);
            return this.msalService.instance
                .logoutRedirect({
                    account: this.getAccount(),
                    // once operator.cruisecode.com is live, update logoutredirecturi for
                    // android to redirect to operator.cruisecode.com/logout - this should
                    // display a “logout” page with a button to “go back to app” and attempt
                    // to open the via a deep link
                    // this is now logging out the user, but the user will be stuck on the browser
                    // (it doesn't automatically trigger the user to go back to the app)
                    postLogoutRedirectUri: 'urn:ietf:wg:oauth:2.0:oob',
                })
                .then(() => {
                    return this.router.navigate(['/home']).then(() => {
                        this.uiState.hideLoadingIndicator();
                        return Promise.resolve();
                    });
                });
        });
    }

    private getAzureB2cOAuth2Options(): OAuth2AuthenticateOptions {
        return {
            appId: environment.capacitorAzureConfig.appId,
            authorizationBaseUrl: `https://cruisecode.b2clogin.com/cruisecode.onmicrosoft.com/${environment.signInSignUpUserFlow}/oauth2/v2.0/authorize`,
            scope: 'openid profile offline_access https://cruisecode.onmicrosoft.com/6e79cbed-6780-452a-90a8-5d42695f4e84/ccapi.read https://cruisecode.onmicrosoft.com/6e79cbed-6780-452a-90a8-5d42695f4e84/ccapi.write', // See Azure Portal -> API permission
            accessTokenEndpoint: `https://cruisecode.b2clogin.com/cruisecode.onmicrosoft.com/${environment.signInSignUpUserFlow}/oauth2/v2.0/token`,
            logsEnabled: true,
            web: {
                pkceEnabled: true,
                responseType: 'code',
                redirectUrl: 'http://localhost:4200/auth',
                windowOptions: 'height=600,left=0,top=0',
            },
            android: {
                pkceEnabled: true,
                responseType: 'code',
                redirectUrl:
                    environment.capacitorAzureConfig.android.redirectUrl,
                handleResultOnNewIntent: true,
                handleResultOnActivityResult: true,
            },
            // this is not currently in use, leaving it here for future reference
            ios: {
                pkceEnabled: true,
                responseType: 'code',
                redirectUrl: environment.capacitorAzureConfig.ios.redirectUrl,
            },
        };
    }
}
