import { Component, inject } from '@angular/core';
import { Assets, AuthToken } from '@app/core';
import { ButtonModule } from 'primeng/button';
import { environment } from 'src/environments/environment';

@Component({
    standalone: true,
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [ButtonModule],
})
export class HomeComponent {
    headerLogo = `${environment.cruiseCodeApiBaseUrl}${Assets.headers.cruiseCodeLogoTransparent}`;
    authService = inject(AuthToken);
    login(): void {
        this.authService.login();
    }
}
