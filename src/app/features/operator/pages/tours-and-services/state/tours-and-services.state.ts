import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import {
    UserState,
    TourInventoryApiService,
    FAQCategory,
    AddOnsItem,
    UIStatus,
    RefundPolicy,
} from '@app/core';

@Injectable()
export class ToursAndServicesState {
    userState = inject(UserState);
    tourInventoryApiService = inject(TourInventoryApiService);

    refundPolicies$ = new BehaviorSubject<RefundPolicy[]>([]);
    faqCategories$ = new BehaviorSubject<FAQCategory[] | []>([]);
    addOns$ = new BehaviorSubject<AddOnsItem[] | []>([]);
    status$ = new BehaviorSubject<{
        loadFaqCategories: UIStatus;
        loadAddOns: UIStatus;
        loadRefundPolicies: UIStatus;
    }>({
        loadFaqCategories: 'idle',
        loadAddOns: 'idle',
        loadRefundPolicies: 'idle',
    });
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.userState.getAspNetUser().then((user) => {
            if (user?.companyUniqueID) {
                this.loadFaqCategories(user.companyUniqueID);
                this.loadAddOns(user.companyUniqueID);
                this.loadRefundPolicies();
            }
        });
    }

    loadFaqCategories(companyId: string): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            loadFaqCategories: 'loading',
        });
        this.faqCategories$.next([]);
        return lastValueFrom(
            this.tourInventoryApiService.getFAQCategories(companyId)
        )
            .then((res) => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadFaqCategories: 'success',
                });
                this.faqCategories$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadFaqCategories: 'error',
                });
                return Promise.resolve();
            });
    }

    loadAddOns(companyId: string): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            loadAddOns: 'loading',
        });
        this.addOns$.next([]);
        return lastValueFrom(this.tourInventoryApiService.getAddons(companyId))
            .then((res) => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadAddOns: 'success',
                });
                this.addOns$.next(res.data);
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadAddOns: 'error',
                });
                return Promise.resolve();
            });
    }

    loadRefundPolicies(): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            loadRefundPolicies: 'loading',
        });
        this.refundPolicies$.next([]);
        return lastValueFrom(this.tourInventoryApiService.getRefundPolicies())
            .then((res) => {
                return Promise.resolve(res.data);
            })
            .then((refundPolicies) => {
                this.refundPolicies$.next(refundPolicies);
                this.status$.next({
                    ...this.status$.getValue(),
                    loadRefundPolicies: 'success',
                });
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadRefundPolicies: 'error',
                });
                return Promise.resolve();
            });
    }
}
