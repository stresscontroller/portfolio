/**
 * This file contains authentication parameters. Contents of this file
 * is roughly the same across other MSAL.js libraries. These parameters
 * are used to initialize Angular and MSAL Angular configurations in
 * in app.module.ts file.
 */

import {
    LogLevel,
    Configuration,
    BrowserCacheLocation,
    IPublicClientApplication,
    PublicClientApplication,
    InteractionType,
} from '@azure/msal-browser';
import {
    MsalInterceptorConfiguration,
    MsalGuardConfiguration,
    ProtectedResourceScopes,
} from '@azure/msal-angular';

import { environment } from 'src/environments/environment';

const isIE =
    window.navigator.userAgent.indexOf('MSIE ') > -1 ||
    window.navigator.userAgent.indexOf('Trident/') > -1;
const apiUrl = environment.cruiseCodeApiBaseUrl;

/**
 * Enter here the user flows and custom policies for your B2C application,
 * To learn more about user flows, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
export const b2cPolicies = {
    names: {
        signUpSignIn: environment.signInSignUpUserFlow,
        signUpSignInCheckout: environment.signInSignUpCheckoutUserFlow,
        signUpSignInReview: environment.signInSignUpReviewUserFlow,
        signInROPCFirstTimeCheckout:
            environment.signInROPCFirstTimeCheckoutUserFlow,
        resetPassword: 'B2C_1_ResetPassword',
        editProfile: 'B2C_1_EditProfile',
    },
    authorities: {
        signUpSignIn: {
            authority: environment.signInSignUpAuthority,
        },
        signUpSignInCheckout: {
            authority: environment.signInSignUpCheckoutAuthority,
        },
        signUpSignInReview: {
            authority: environment.signInSignUpReviewAuthority,
        },
        signInROPCFirstTimeCheckout: {
            authority: environment.signInROPCFirstTimeCheckoutAuthority,
        },
        resetPassword: {
            authority:
                'https://cruisecode.b2clogin.com/cruisecode.onmicrosoft.com/B2C_1_ResetPassword',
        },
        editProfile: {
            authority:
                'https://cruisecode.b2clogin.com/cruisecode.onmicrosoft.com/B2C_1_EditProfile',
        },
    },
    authorityDomain: 'cruisecode.b2clogin.com',
};

// Roles for hiding/guarding specific elements
export const roles = {
    InhouseAgent: 'extension_IsInhouseAgent',
    Affiliate: 'extension_IsAffiliate',
    Agent: 'extension_IsAgent',
    Developer: 'extension_IsDeveloper',
    User: 'extension_IsUser',
    Admin: 'extension_IsAdmin',
    Employee: 'extension_IsEmployee',
    CruiseCodeAdmin: 'extension_IsCruiseCodeAdmin',
};

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig: Configuration = {
    auth: {
        clientId: '0471f107-0166-4098-a546-40f9ec89f5fe', // This is the ONLY mandatory field that you need to supply.
        authority: b2cPolicies.authorities.signUpSignIn.authority, // Defaults to "https://login.microsoftonline.com/common"
        knownAuthorities: [b2cPolicies.authorityDomain], // Mark your B2C tenant's domain as trusted.
        redirectUri: '/auth', // Points to window.location.origin by default. You must register this URI on Azure portal/App Registration.
        postLogoutRedirectUri: '/', // Points to window.location.origin by default.
        navigateToLoginRequestUrl: true, // If a user is intercepted logging in put them back to the requested routes
    },
    cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage, // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
        storeAuthStateInCookie: isIE, // Set this to "true" if you are having issues on IE11 or Edge. Remove this line to use Angular Universal
    },
    system: {
        /**
         * Below you can configure MSAL.js logs. For more information, visit:
         * https://docs.microsoft.com/azure/active-directory/develop/msal-logging-js
         */
        loggerOptions: {
            loggerCallback(_logLevel: LogLevel, _message: string) {
                // Uncomment this if you want to see detailed auth events in the console, probably don't want this in production
                if (!environment.production) {
                    // console.log(message);
                }
            },
            // logLevel: LogLevel.Verbose,
            logLevel: LogLevel.Info,
            piiLoggingEnabled: false,
        },
    },
};

/**
 * Add here the endpoints and scopes when obtaining an access token for protected web APIs. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const protectedResources = {
    // Use this for protecting the entire website, this will enforce authorization for every endpoint on the ui not specifically left out
    cruiseCodeWebApi: {
        endpoint: apiUrl,
        scopes: {
            read: [
                'https://cruisecode.onmicrosoft.com/6e79cbed-6780-452a-90a8-5d42695f4e84/ccapi.read',
            ],
            write: [
                'https://cruisecode.onmicrosoft.com/6e79cbed-6780-452a-90a8-5d42695f4e84/ccapi.write',
            ],
        },
    },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
    scopes: [],
};

/**
 * Here we pass the configuration parameters to create an MSAL instance.
 * For more info, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/configuration.md
 */
export function MSALInstanceFactory(): IPublicClientApplication {
    return new PublicClientApplication(msalConfig);
}

/**
 * MSAL Angular will automatically retrieve tokens for resources
 * added to protectedResourceMap. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/initialization.md#get-tokens-for-web-api-calls
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<
        string,
        Array<string | ProtectedResourceScopes> | null
    >();
    const protectedScopeMap = [
        {
            httpMethod: 'GET',
            scopes: [...protectedResources.cruiseCodeWebApi.scopes.read],
        },
        {
            httpMethod: 'POST',
            scopes: [...protectedResources.cruiseCodeWebApi.scopes.write],
        },
        {
            httpMethod: 'PUT',
            scopes: [...protectedResources.cruiseCodeWebApi.scopes.write],
        },
        {
            httpMethod: 'DELETE',
            scopes: [...protectedResources.cruiseCodeWebApi.scopes.write],
        },
    ];
    // Protect the specific endpoints for writing reviews
    protectedResourceMap.set(
        protectedResources.cruiseCodeWebApi.endpoint +
            'TourInventory/PostTourReview',
        protectedScopeMap
    );
    protectedResourceMap.set(
        protectedResources.cruiseCodeWebApi.endpoint +
            'TourInventory/PostTourReviewComment',
        protectedScopeMap
    );

    // Allow all other tour inventory requests
    protectedResourceMap.set(
        protectedResources.cruiseCodeWebApi.endpoint + 'TourInventory',
        null
    );

    // Protect the specific endpoints for getting and updating user information
    protectedResourceMap.set(
        protectedResources.cruiseCodeWebApi.endpoint + 'B2C/GetB2CUser',
        protectedScopeMap
    );
    protectedResourceMap.set(
        protectedResources.cruiseCodeWebApi.endpoint + 'B2C/UpdateB2CUser',
        protectedScopeMap
    );

    // Allow all other B2C requests
    protectedResourceMap.set(
        protectedResources.cruiseCodeWebApi.endpoint + 'B2C',
        null
    );

    // protect the rest of the website
    protectedResourceMap.set(
        protectedResources.cruiseCodeWebApi.endpoint,
        protectedScopeMap
    );

    // protect the rest of the website
    protectedResourceMap.set(
        protectedResources.cruiseCodeWebApi.endpoint,
        protectedScopeMap
    );

    return {
        interactionType: InteractionType.Redirect,
        protectedResourceMap,
    };
}

/**
 * Set your default interaction type for MSALGuard here. If you have any
 * additional scopes you want the user to consent upon login, add them here as well.
 */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        authRequest: loginRequest,
    };
}
