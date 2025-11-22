import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
    NavigationState,
    UIState,
    ConnectivityToken,
    UserState,
    AuthToken,
    DeviceService,
} from '@app/core';
import { EventType } from '@azure/msal-browser';
import { debounce, distinctUntilChanged, filter, map, of, timer } from 'rxjs';
import {
    ConfirmationDialogComponent,
    ConnectivityBannerComponent,
    ErrorDialogComponent,
    ImageLightboxModalComponent,
    LoaderComponent,
    LoaderStaticComponent,
    SuccessDialogComponent,
} from '@app/shared';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        LoaderComponent,
        LoaderStaticComponent,
        ConfirmationDialogComponent,
        SuccessDialogComponent,
        ErrorDialogComponent,
        ImageLightboxModalComponent,
        ConnectivityBannerComponent,
    ],
})
export class AppComponent {
    router = inject(Router);
    connectivityService = inject(ConnectivityToken);
    navigationState = inject(NavigationState);
    deviceService = inject(DeviceService);
    authService = inject(AuthToken);
    uiState = inject(UIState);
    userState = inject(UserState);

    displayApp$ = this.authService.msalEvents$.pipe(
        filter(
            (event) =>
                event.eventType === EventType.HANDLE_REDIRECT_END ||
                event.eventType === EventType.HANDLE_REDIRECT_START
        ),
        distinctUntilChanged((prev, curr) => prev.eventType === curr.eventType),
        debounce((event) =>
            // allow app to settle down before hiding loader
            event.eventType === EventType.HANDLE_REDIRECT_START
                ? of({})
                : timer(500)
        ),
        map((event) => {
            if (event.eventType === EventType.HANDLE_REDIRECT_END) {
                return true;
            }
            return false;
        })
    );

    ngOnInit(): void {
        this.authService.init();
        this.authService.initListeners();
        this.navigationState.init();
        this.connectivityService.startMonitoring();
        this.userState.listenToUserChanges();
        this.deviceService.initResizeObserver();
    }
}
