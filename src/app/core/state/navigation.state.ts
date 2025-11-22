import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class NavigationState {
    history$ = new BehaviorSubject<string[]>([]);

    router = inject(Router);

    init(): void {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                const history = this.history$.getValue();
                history.push(event.url);

                this.history$.next(history.slice(-5));
            }
        });
    }

    hasHistory(): boolean {
        return this.history$.getValue().length > 1;
    }
}
