import { Injectable, inject } from '@angular/core';
import { PolicyConfig, TourInventoryApiService, UIStatus } from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { TourEditState } from '../../state';

@Injectable()
export class RefundPolicyState {
    tourEditState = inject(TourEditState);

    tourInventoryApiService = inject(TourInventoryApiService);
    modals$ = new BehaviorSubject<{
        updatePolicy: {
            isOpen: boolean;
            context?: PolicyConfig;
        };
    }>({
        updatePolicy: {
            isOpen: false,
        },
    });

    status$ = new BehaviorSubject<UIStatus>('idle');

    openUpdatePolicyModal(context: PolicyConfig): void {
        this.modals$.next({
            updatePolicy: {
                isOpen: true,
                context,
            },
        });
    }

    closeUpdatePolicyModal(): void {
        this.modals$.next({
            updatePolicy: {
                isOpen: false,
            },
        });
    }

    updateRefundPolicy(config: PolicyConfig): void {
        this.status$.next('loading');

        lastValueFrom(
            this.tourInventoryApiService.saveTourRefundPolicy({
                ...config,
                createdBy: '',
            })
        )
            .then(() => {
                this.status$.next('success');
                this.closeUpdatePolicyModal();
                this.tourEditState.refresh();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
