import { Component, inject } from '@angular/core';
import { RefundPolicyState } from '../../refund-policy.state';
import { distinctUntilChanged, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PolicyConfig } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-save-refund-policy-modal',
    templateUrl: './save-refund-policy.component.html',
    styleUrl: './save-refund-policy.component.scss',
    imports: [CommonModule, DialogModule, ButtonModule],
})
export class SaveRefundPolicyModalComponent {
    refundPolicyState = inject(RefundPolicyState);
    refundPolicyModal$ = this.refundPolicyState.modals$.pipe(
        map((modals) => modals.updatePolicy),
        distinctUntilChanged()
    );

    isOpen$ = this.refundPolicyModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.refundPolicyModal$.pipe(map((modal) => modal.context));
    status$ = this.refundPolicyState.status$;

    tourRefundPolicyConfig: PolicyConfig = {
        tourId: 0,
        tourServiceRefundPolicyId: 0,
        createdBy: '',
    };

    ngOnInit(): void {
        this.context$.subscribe((context) => {
            if (context) {
                this.tourRefundPolicyConfig = context;
            }
        });
    }

    save(): void {
        this.refundPolicyState.updateRefundPolicy(this.tourRefundPolicyConfig);
    }

    close(): void {
        this.refundPolicyState.closeUpdatePolicyModal();
    }
}
