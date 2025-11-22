import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectivityToken } from '@app/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    standalone: true,
    selector: 'app-connectivity-banner',
    templateUrl: './connectivity-banner.component.html',
    styleUrls: ['./connectivity-banner.component.scss'],
    imports: [CommonModule],
    animations: [
        trigger('fadeSlideUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(100px)' }),
                animate(
                    '250ms ease-in-out',
                    style({ opacity: 1, transform: 'translateY(0)' })
                ),
            ]),
            transition(':leave', [
                animate(
                    '200ms ease-in-out',
                    style({ opacity: 0, transform: 'translateY(100px)' })
                ),
            ]),
        ]),
    ],
})
export class ConnectivityBannerComponent {
    connectivityService = inject(ConnectivityToken);

    isOnline$ = this.connectivityService.isOnline$;
}
