import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import {
    UIStatus,
    UserState,
    PayRateListItem,
    PayRateConfig,
    CompanySettingsApiService,
} from '@app/core';
import { PositionsState } from './positions.state';

@Injectable()
export class PayRatesState {
    userState = inject(UserState);
    positionsState = inject(PositionsState);
    companySettingsApiService = inject(CompanySettingsApiService);
    payRateList$ = new BehaviorSubject<PayRateListItem[]>([]);
    statuses$ = new BehaviorSubject<{
        loadPayRates: UIStatus;
        savePayRate: UIStatus;
    }>({
        loadPayRates: 'idle',
        savePayRate: 'idle',
    });

    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.refreshTriggered$.subscribe(() => {});
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    getPayRateList(positionId: number): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID ?? '';
        this.updateStatus('loadPayRates', 'loading');
        this.payRateList$.next([]);
        return lastValueFrom(
            this.companySettingsApiService.getPayRateList(companyID, positionId)
        )
            .then((res) => {
                this.updateStatus('loadPayRates', 'success');
                this.payRateList$.next(res.data);
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('loadPayRates', 'error');
                return Promise.reject(error);
            });
    }

    savePayRate(config: PayRateConfig): Promise<void> {
        this.updateStatus('savePayRate', 'loading');
        return this.userState.getAspNetUser().then((user) => {
            return lastValueFrom(
                this.companySettingsApiService.savePayRate({
                    ...config,
                    positionId: this.positionsState.positionId$.getValue() ?? 0,
                    companyUniqueId: user?.companyUniqueID ?? '',
                })
            )
                .then((res) => {
                    if (res.success) {
                        this.refresh();
                        this.updateStatus('savePayRate', 'success');
                        return Promise.resolve();
                    } else {
                        return Promise.reject(res.error);
                    }
                })
                .catch(() => {
                    this.updateStatus('savePayRate', 'error');
                });
        });
    }

    deletePayRate(id: number, isActive: boolean): Promise<void> {
        return lastValueFrom(
            this.companySettingsApiService.deletePayRate(id, isActive)
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.error);
            }
            this.refresh();
            return Promise.resolve();
        });
    }

    private updateStatus(
        key: 'loadPayRates' | 'savePayRate',
        status: 'idle' | 'loading' | 'success' | 'error'
    ): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
