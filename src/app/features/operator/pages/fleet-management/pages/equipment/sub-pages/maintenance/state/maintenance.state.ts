import { Injectable, inject } from '@angular/core';
import { UserState } from '@app/core';
import { BehaviorSubject } from 'rxjs';
import { UIStatus } from '@app/core';

@Injectable()
export class MaintenanceState {
    userState = inject(UserState);
    status$ = new BehaviorSubject<UIStatus>('idle');
    private refreshTriggered$ = new BehaviorSubject<number>(0);

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.refreshTriggered$.subscribe(() => {
            this.userState.getAspNetUser().then((_user) => {
                // const companyId = user?.companyUniqueID ?? '';
            });
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }
}
