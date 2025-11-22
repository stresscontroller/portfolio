import { Injectable, inject } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
    providedIn: 'root',
})
export class PwaService {
    platform = inject(Platform);
    swUpdate = inject(SwUpdate);

    // eslint-disable-next-line
    private promptEvent: any;
    installationViaButtonSupported = false;

    init(): void {
        // eslint-disable-next-line
        window.addEventListener('beforeinstallprompt', (event: any) => {
            event.preventDefault();
            this.promptEvent = event;
            this.installationViaButtonSupported = true;
        });
    }

    installPwa(): void {
        if (this.promptEvent) {
            try {
                const isInStandaloneMode = window.matchMedia(
                    '(display-mode: standalone)'
                ).matches;
                if (!isInStandaloneMode) {
                    this.promptEvent.prompt();
                }
            } catch (error) {
                // unable to install PWA
                this.installationViaButtonSupported = false;
            }
        }
    }
}
