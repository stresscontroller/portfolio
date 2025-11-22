import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { Assets, UIState } from '@app/core';
import { debounce, of, timer } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
    standalone: true,
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
    imports: [CommonModule],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('500ms', style({ opacity: 1 })),
            ]),
            transition(':leave', [animate('500ms', style({ opacity: 0 }))]),
        ]),
    ],
})
export class LoaderComponent {
    uiState = inject(UIState);

    headerLogo = `${environment.cruiseCodeApiBaseUrl}${Assets.headers.cruiseCodeLogoTransparent}`;

    loadingIndicator$ = this.uiState.loadingIndicator$.pipe(
        // add 300ms debounce when closing the loading indicator
        // to prevent flickering when another part of the app is triggering
        // the loading indicator
        debounce((ev) => (ev === true ? of({}) : timer(300)))
    );
}
