import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { RefundPolicyState } from './refund-policy.state';
import { SaveRefundPolicyModalComponent } from './modals';
import { TourEditState } from '../../state';
import { ToursAndServicesState } from '../../../../state';
import { Features } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-refund-policy',
    templateUrl: './refund-policy.component.html',
    styleUrls: ['./refund-policy.component.scss'],
    imports: [
        CommonModule,
        RadioButtonModule,
        FormsModule,
        ButtonModule,
        SaveRefundPolicyModalComponent,
        PermissionDirective,
    ],
    providers: [RefundPolicyState],
})
export class RefundPolicyComponent {
    tourEditState = inject(TourEditState);
    toursAndServicesState = inject(ToursAndServicesState);
    refundPolicyState = inject(RefundPolicyState);
    features = Features;
    refundPolicies$ = this.toursAndServicesState.refundPolicies$;
    refundPolicySelected: number | null = null;

    tourDetails$ = this.tourEditState.tourDetails$;

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.tourDetails$
            .pipe(takeUntil(this.destroyed$))
            .subscribe((tourDetails) => {
                if (tourDetails) {
                    this.refundPolicySelected =
                        tourDetails.tourServiceRefundPolicyId;
                } else {
                    this.refundPolicySelected = null;
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    updateRefundPolicy(): void {
        const tourId = this.tourEditState.tourId$.getValue();
        if (!tourId || !this.refundPolicySelected) {
            return;
        }
        this.refundPolicyState.openUpdatePolicyModal({
            tourId: tourId,
            tourServiceRefundPolicyId: this.refundPolicySelected,
        });
    }
}
