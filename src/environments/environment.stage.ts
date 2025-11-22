export const environment = {
    production: false,
    cruiseCodeApiBaseUrl: 'https://apistage.cruisecode.com/',
    cruiseCodeEmailApiBaseUrl: 'https://emailstage.cruisecode.com/',
    signInSignUpUserFlow: 'B2C_1_SignInSignUp_Stage',
    signInSignUpAuthority:
        'https://cruisecode.b2clogin.com/cruisecode.onmicrosoft.com/B2C_1_SignInSignUp_Stage',
    signInSignUpCheckoutUserFlow: 'B2C_1_SignInSignUp_Checkout_Stage',
    signInSignUpCheckoutAuthority:
        'https://cruisecode.b2clogin.com/cruisecode.onmicrosoft.com/B2C_1_SignInSignUp_Checkout_Stage',
    signInSignUpReviewUserFlow: 'B2C_1_SignInSignUp_Review_Stage',
    signInSignUpReviewAuthority:
        'https://cruisecode.b2clogin.com/cruisecode.onmicrosoft.com/B2C_1_SignInSignUp_Review_Stage',
    signInROPCFirstTimeCheckoutUserFlow:
        'https://cruisecode.b2clogin.com/cruisecode.onmicrosoft.com/B2C_1_SignInROPCFirstTimeCheckout',
    signInROPCFirstTimeCheckoutAuthority: 'B2C_1_SignInROPCFirstTimeCheckout',
    resetUserPasswordFlow: 'B2C_1_ResetPassword',
    resetUserPasswordLink:
        'https://cruisecode.b2clogin.com/cruisecode.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_ResetPassword&client_id=0471f107-0166-4098-a546-40f9ec89f5fe&nonce=defaultNonce&redirect_uri=https%3A%2F%2Foperatordev.com%2Fsign-in-redirect&scope=openid%20profile%20offline_access&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=2.32.1&client_info=1&code_challenge=CEuP4RsX0EkotfjvcPRqiG-RFIQmsK04VbvecH3LwyQ&code_challenge_method=S256&nonce=a9dd2070-2164-48ae-89cd-c0229f41205c&state=eyJpZCI6IjQyYjcyM2ViLWM5NDEtNDBmMi04MTlhLTc5NmViZGFmMDExOSIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3D',
    resetUserPasswordAuthority:
        'https://cruisecode.b2clogin.com/cruisecode.onmicrosoft.com/B2C_1_ResetPassword',
    cartLocalStorageVersion: '1.3',
    dtdAndroidAppDownloadUrl:
        'https://cruisecodestorageaccount.blob.core.windows.net/cruisecode/dtd-apk/stage/app-release.apk',
    // Azure AD auth via Cap plugin
    capacitorAzureConfig: {
        appId: '0471f107-0166-4098-a546-40f9ec89f5fe', // clientId
        // https://learn.microsoft.com/en-us/azure/azure-portal/get-subscription-tenant-id#find-your-azure-ad-tenant
        tenantId: '2c99a69e-eb33-4680-b07c-e813b31b77f2',
        web: {
            redirectUrl: 'https://angulardev.cruisecode.com/auth',
        },
        android: {
            // [IMPORTANT] we also need to set the hash in strings.xml
            // it doesn't change between environments, so we can leave it there
            redirectUrl:
                'msauth://app.cruisecode.dtd/N7bW5TFz7S0GRMxMr5mfEvhnkuE%3D',
        },
        ios: {
            redirectUrl: 'msauth.app.cruisecode.dtd://auth',
        },
    },
};
