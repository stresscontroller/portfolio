import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { animate, style, transition, trigger } from '@angular/animations';
import { UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-notification-banner',
    templateUrl: './notification-banner.component.html',
    styleUrls: ['./notification-banner.component.scss'],
    imports: [CommonModule, ButtonModule, ToastModule],
    animations: [
        trigger('fadeSlideInOut', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-50px)' }),
                animate(
                    '250ms ease-in-out',
                    style({ opacity: 1, transform: 'translateY(0)' })
                ),
            ]),
            transition(':leave', [
                animate(
                    '200ms ease-in-out',
                    style({ opacity: 0, transform: 'translateY(-50px)' })
                ),
            ]),
        ]),
    ],
})
export class NotificationBannerComponent {
    uiState = inject(UIState);

    notificationBanner$ = this.uiState.banners$.pipe(
        map((banners) => banners.notification),
        distinctUntilChanged()
    );

    isOpen$ = this.notificationBanner$.pipe(map((banner) => banner.isOpen));
    context$ = this.notificationBanner$.pipe(
        filter((banner) => banner.isOpen),
        map((banner) => banner.context)
    );

    close(): void {
        this.uiState.closeNotificationBanner();
    }
}
