import { Injectable, NgZone, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Network } from '@capacitor/network';
import { ConnectivityServiceBase } from '../base';

@Injectable({
    providedIn: 'root',
})
export class MobileConnectivityService implements ConnectivityServiceBase {
    private _isOnline$ = new BehaviorSubject<boolean>(true);
    isOnline$ = this._isOnline$.asObservable();
    zone = inject(NgZone);

    isOnline(): Promise<boolean> {
        return Network.getStatus().then((status) => {
            this._isOnline$.next(status.connected);
            return status.connected;
        });
    }

    startMonitoring(): void {
        Network.getStatus().then((status) => {
            this._isOnline$.next(status.connected);
        });
        this.stopMonitoring();
        Network.addListener('networkStatusChange', (status) => {
            if (status.connected !== this._isOnline$.getValue()) {
                // run inside zone to trigger change detection
                this.zone.run(() => {
                    this._isOnline$.next(status.connected);
                });
            }
        });
    }

    stopMonitoring(): void {
        Network.removeAllListeners();
    }
}
