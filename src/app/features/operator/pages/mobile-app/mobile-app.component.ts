import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Features, PwaService } from '@app/core';
import { DividerModule } from 'primeng/divider';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-mobile-app',
    templateUrl: './mobile-app.component.html',
    styleUrls: ['./mobile-app.component.scss', '../../operator.scss'],
    imports: [CommonModule, ButtonModule, DividerModule, PermissionDirective],
})
export class MobileAppComponent {
    // androidAppDownloadUrl = environment.dtdAndroidAppDownloadUrl;
    features = Features;

    pwaService = inject(PwaService);
    installationViaButtonSupported =
        this.pwaService.installationViaButtonSupported;

    installApp(): void {
        this.pwaService.installPwa();
    }
}
