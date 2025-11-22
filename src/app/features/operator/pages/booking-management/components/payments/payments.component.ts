import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { PaymentsState } from './payments.state';
import { RouterModule } from '@angular/router';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import {
    LoaderEmbedComponent,
    PermissionConfig,
    PermissionDirective,
} from '@app/shared';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, takeUntil } from 'rxjs';
import { AddPaymentModalComponent } from './modals/add-payment-modal.component';
import { CalendarModule } from 'primeng/calendar';
import { adjustDate, paymentTypes } from '@app/core';
@Component({
    standalone: true,
    selector: 'app-payments',
    templateUrl: './payments.component.html',
    styleUrls: ['./payments.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        TableModule,
        InputSwitchModule,
        InputTextModule,
        ButtonModule,
        DividerModule,
        LoaderEmbedComponent,
        PermissionDirective,
        AddPaymentModalComponent,
        CalendarModule,
        PermissionDirective,
    ],
    providers: [PaymentsState],
})
export class PaymentsComponent {
    @Input() addPermission?: PermissionConfig;
    @Input() set agentId(value: string | number | undefined | null) {
        this.paymentsState.setAgentId(value ? +value : undefined);
    }

    paymentsState = inject(PaymentsState);
    status$ = this.paymentsState.status$;
    payments$ = this.paymentsState.payments$;
    private destroyed$ = new Subject<void>();
    paymentTypes = paymentTypes;
    paymentControls = new FormGroup({
        startDate: new FormControl<Date | null>(
            this.paymentsState.config$.getValue().fromDate
        ),
        endDate: new FormControl<Date | null>(
            this.paymentsState.config$.getValue().toDate
        ),
    });

    ngOnInit(): void {
        this.paymentsState.init();
        this.paymentControls.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((value) => {
                this.paymentsState.setFilterDates(
                    value.startDate || this.getStartDate(),
                    value.endDate || new Date()
                );
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    openPaymentModal(): void {
        this.paymentsState.openPaymentModal();
    }

    getPaymentName(paymentType: string): string {
        return (
            this.paymentTypes.find((type) => type.paymentType === paymentType)
                ?.name || '-'
        );
    }
    private getStartDate(endDate?: Date): Date {
        if (endDate) {
            return adjustDate(
                new Date(
                    endDate.getFullYear(),
                    endDate.getMonth() - 3,
                    endDate.getDate()
                )
            );
        }
        const today = new Date();
        return adjustDate(
            new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
        );
    }
}
