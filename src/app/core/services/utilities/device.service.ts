import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DeviceService {
    private observing = false;
    initResizeObserver(): void {
        if (this.observing) {
            return;
        }
        this.observing = true;
        this.updateVh();
        window.addEventListener('resize', () => {
            this.updateVh();
        });
    }

    private updateVh(): void {
        try {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        } catch (err) {
            // swallow error
        }
    }
}
