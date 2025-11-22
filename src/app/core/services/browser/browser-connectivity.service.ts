import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, fromEvent, map, merge, of } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { ConnectivityServiceBase } from '../base';

@Injectable({
    providedIn: 'root',
})
export class BrowserConnectivityService implements ConnectivityServiceBase {
    private _isOnline$ = new BehaviorSubject<boolean>(true);
    isOnline$ = this._isOnline$.asObservable();

    private window: Window | null;
    private networkMonitorListener$: Subscription | null = null;

    constructor(@Inject(DOCUMENT) private document: Document) {
        this.window = this.document.defaultView;
    }

    isOnline(): Promise<boolean> {
        if (this.window) {
            const isOnline = this.window.navigator.onLine;
            this._isOnline$.next(isOnline);
            return Promise.resolve(isOnline);
        }
        return Promise.resolve(this._isOnline$.getValue());
    }

    startMonitoring(): void {
        if (!this.window) {
            return;
        }
        this.stopMonitoring();
        const navigator = this.window.navigator;
        this._isOnline$.next(navigator.onLine);
        this.networkMonitorListener$ = merge(
            of(null),
            fromEvent(window, 'online'),
            fromEvent(window, 'offline')
        )
            .pipe(map(() => navigator.onLine))
            .subscribe((status) => {
                this._isOnline$.next(status);
            });
    }

    stopMonitoring(): void {
        if (this.networkMonitorListener$) {
            this.networkMonitorListener$.unsubscribe();
            this.networkMonitorListener$ = null;
        }
    }
}
