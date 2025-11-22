import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    BehaviorSubject,
    Subject,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    takeUntil,
} from 'rxjs';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import {
    paymentTypes,
    AgentInvoicePayment,
    debounceTimes,
    OperatorFiltersState,
} from '@app/core';
import { CheckboxModule } from 'primeng/checkbox';
import { PaymentsState } from '../payments.state';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    standalone: true,
    selector: 'app-add-payment-modal',
    templateUrl: './add-payment-modal.component.html',
    styleUrls: ['./add-payment-modal.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        CalendarModule,
        CheckboxModule,
        DropdownModule,
        DialogModule,
    ],
})
export class AddPaymentModalComponent {
    private isDestroyed$ = new Subject<void>();
    paymentState = inject(PaymentsState);
    operatorFiltersState = inject(OperatorFiltersState);
    paymentTypes = paymentTypes;
    addPaymentModal$ = this.paymentState.modals$.pipe(
        map((modals) => modals.addPayment),
        distinctUntilChanged()
    );
    isLoading$ = new BehaviorSubject<boolean>(false);
    isOpen$ = this.addPaymentModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.addPaymentModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    paymentForm = new FormGroup({
        amount: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        agentId: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        paymentDate: new FormControl<Date | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        paymentType: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        showOnlyCruiseLines: new FormControl<boolean>(false),
    });

    showOnlyCruiseLines$ = new BehaviorSubject<boolean>(false);
    agents$ = this.operatorFiltersState.associatedAgents$;
    filteredAgentList$ = this.showOnlyCruiseLines$.pipe(
        debounceTime(debounceTimes.filterDebounce),
        distinctUntilChanged(),
        map((showOnlyCruiseLines) => {
            return this.agents$.getValue().filter((agent) => {
                if (showOnlyCruiseLines) {
                    return agent.isCruiseLine;
                } else {
                    return true;
                }
            });
        })
    );

    ngOnInit(): void {
        this.operatorFiltersState.getAssociatedAgents();
        this.operatorFiltersState.getCruiseLines();
        this.context$
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((context) => {
                this.paymentForm.patchValue(context);
                if (context.agentId) {
                    this.paymentForm.controls.agentId.disable();
                } else {
                    this.paymentForm.controls.agentId.enable();
                }
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    close(): void {
        this.paymentForm.clearValidators();
        this.paymentForm.reset();
        this.paymentState.closePaymentModal();
    }

    addPayment(): void {
        this.isLoading$.next(true);
        const formValues = this.paymentForm.getRawValue();
        const companyId =
            this.agents$
                .getValue()
                .find((agent) => agent.partnerId === formValues.agentId)
                ?.companyUniqueId || '';

        const agentInvoicePayment: AgentInvoicePayment = {
            amount: formValues.amount!,
            agentId: formValues.agentId!,
            paymentDate: formValues.paymentDate!,
            paymentType: formValues.paymentType!,
            agentInvoicePaymentId: null,
            agentInvoiceId: 0,
            companyId: companyId,
            paymentMode: null,
            chequeNumber: null,
            authorizeCode: null,
            paymentStatus: null,
            notes: '',
            isActive: true,
            createdDate: new Date(),
        };

        this.paymentState.addPayment(agentInvoicePayment).then((success) => {
            if (success) {
                this.isLoading$.next(false);
                this.paymentState.refresh();
                this.close();
            } else {
                this.isLoading$.next(false);
                this.paymentState.refresh();
                this.close();
            }
        });
    }

    toggleFilterOnlyCruiseLines(): void {
        this.showOnlyCruiseLines$.next(!this.showOnlyCruiseLines$.getValue());
    }
}
