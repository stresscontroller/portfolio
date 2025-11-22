import {
    APP_INITIALIZER,
    enableProdMode,
    importProvidersFrom,
    isDevMode,
} from '@angular/core';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { ROUTES } from './app/routes';
import {
    HTTP_INTERCEPTORS,
    provideHttpClient,
    withInterceptors,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
    MSAL_GUARD_CONFIG,
    MSAL_INSTANCE,
    MSAL_INTERCEPTOR_CONFIG,
    MsalBroadcastService,
    MsalGuard,
    MsalInterceptor,
    MsalModule,
    MsalService,
} from '@azure/msal-angular';
import { MessageService } from 'primeng/api';
import {
    CalendarModule as AngularCalendarModule,
    DateAdapter,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import {
    MSALGuardConfigFactory,
    MSALInstanceFactory,
    MSALInterceptorConfigFactory,
} from './app/core/configs/auth.config';
import {
    AuthToken,
    ConnectivityToken,
    SecureStorageToken,
} from './app/core/configs';
import {
    BrowserAuthService,
    BrowserConnectivityService,
    BrowserSecureStorageService,
    MobileAuthService,
    MobileConnectivityService,
    MobileSecureStorageService,
    PwaService,
} from './app/core/services';
import { Capacitor } from '@capacitor/core';
import { AuthInterceptor } from './app/core/interceptors';
import { provideServiceWorker } from '@angular/service-worker';

if (environment.production) {
    enableProdMode();
}
const appInitializer = (pwaService: PwaService) => () => pwaService.init();

bootstrapApplication(AppComponent, {
    providers: [
        provideAnimations(),
        provideRouter(
            ROUTES,
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
        ),
        provideHttpClient(
            withInterceptorsFromDi(),
            withInterceptors([AuthInterceptor])
        ),
        {
            provide: MSAL_INSTANCE,
            useFactory: MSALInstanceFactory,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MsalInterceptor,
            multi: true,
        },
        {
            provide: MSAL_GUARD_CONFIG,
            useFactory: MSALGuardConfigFactory,
        },
        {
            provide: MSAL_INTERCEPTOR_CONFIG,
            useFactory: MSALInterceptorConfigFactory,
        },
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializer,
            multi: true,
            deps: [PwaService],
        },
        MsalGuard,
        MsalBroadcastService,
        MsalModule,
        MsalService,
        MessageService,
        // calendar
        importProvidersFrom(
            AngularCalendarModule.forRoot({
                provide: DateAdapter,
                useFactory: adapterFactory,
            })
        ),
        // services with different implementation for browser and mobile
        {
            provide: ConnectivityToken,
            useClass:
                Capacitor.getPlatform() === 'web'
                    ? BrowserConnectivityService
                    : MobileConnectivityService,
        },
        {
            provide: AuthToken,
            useClass:
                Capacitor.getPlatform() === 'web'
                    ? BrowserAuthService
                    : MobileAuthService,
        },
        {
            provide: SecureStorageToken,
            useClass:
                Capacitor.getPlatform() === 'web'
                    ? BrowserSecureStorageService
                    : MobileSecureStorageService,
        },
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),
    ],
});
