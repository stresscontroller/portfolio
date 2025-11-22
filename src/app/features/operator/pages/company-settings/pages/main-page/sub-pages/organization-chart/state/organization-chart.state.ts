import { Injectable, inject } from '@angular/core';
import {
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    lastValueFrom,
    switchMap,
} from 'rxjs';

import {
    UIStatus,
    UserState,
    CompanySettingsApiService,
    CompanyOrgChart,
} from '@app/core';

@Injectable()
export class OrganizationChartState {
    userState = inject(UserState);
    companySettingsApiService = inject(CompanySettingsApiService);
    orgChart$ = new BehaviorSubject<CompanyOrgChart[] | null>(null);

    statuses$ = new BehaviorSubject<{
        loadOrgChart: UIStatus;
    }>({
        loadOrgChart: 'idle',
    });

    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.userState.user$
            .pipe(
                filter((user) => !!user),
                distinctUntilChanged(),
                switchMap(() => {
                    return this.refreshTriggered$.pipe(distinctUntilChanged());
                })
            )
            .subscribe(() => {
                this.getOrgChart();
            });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    getOrgChart(): Promise<void> {
        if (this.statuses$.getValue().loadOrgChart === 'loading') {
            return Promise.resolve();
        }
        this.updateStatus('loadOrgChart', 'loading');
        this.orgChart$.next(null);
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                this.updateStatus('loadOrgChart', 'error');
                return Promise.resolve();
            }
            return lastValueFrom(
                this.companySettingsApiService.getOrganizationChart(
                    user.companyUniqueID
                )
            )
                .then((res) => {
                    this.updateStatus('loadOrgChart', 'success');
                    this.orgChart$.next(res.data);
                    return Promise.resolve();
                })
                .catch(() => {
                    this.updateStatus('loadOrgChart', 'error');
                    return Promise.resolve();
                });
        });
    }

    private updateStatus(key: 'loadOrgChart', status: UIStatus): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
