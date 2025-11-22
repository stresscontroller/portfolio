import { inject, Injectable } from '@angular/core';
import {
    addDays,
    adjustDate,
    AgentApiService,
    AgentInvoicePayment,
    UIStatus,
    UserState,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, map, switchMap, tap } from 'rxjs';

interface PaymentConfig {
    fromDate: Date;
    toDate: Date;
}
@Injectable()
export class PaymentsState {
    agentService = inject(AgentApiService);
    userState = inject(UserState);
    payments$ = new BehaviorSubject<AgentInvoicePayment[]>([]);
    status$ = new BehaviorSubject<UIStatus>('idle');

    private today = adjustDate(
        new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate()
        )
    );
    agentId$ = new BehaviorSubject<number | undefined>(undefined);
    refreshTriggered$ = new BehaviorSubject<number>(0);
    config$ = new BehaviorSubject<PaymentConfig>({
        fromDate: adjustDate(
            new Date(
                this.today.getFullYear(),
                this.today.getMonth() - 3,
                this.today.getDate()
            )
        ),
        toDate: this.today,
    });

    modals$ = new BehaviorSubject<{
        addPayment: {
            isOpen: boolean;
            context: {
                agentId?: number | null;
            };
        };
    }>({
        addPayment: {
            isOpen: false,
            context: {
                agentId: null,
            },
        },
    });

    private initialized = false;
    init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.agentId$
            .pipe(
                switchMap((agentId) =>
                    this.config$.pipe(
                        switchMap((config) =>
                            this.refreshTriggered$.pipe(
                                tap(() => {
                                    this.loadAgentPayments(agentId, config);
                                })
                            )
                        )
                    )
                )
            )
            .subscribe();
    }

    setAgentId(agentId?: number): void {
        this.agentId$.next(agentId);
    }

    setFilterDates(fromDate: Date, toDate: Date) {
        this.config$.next({
            fromDate,
            toDate,
        });
    }

    loadAgentPayments(
        agentId: number | undefined,
        config: PaymentConfig
    ): void {
        if (agentId) {
            this.status$.next('loading');
            lastValueFrom(this.agentService.getAgentDetails(agentId)).then(
                (agent) => {
                    if (agent?.data) {
                        lastValueFrom(
                            this.agentService.getPayments(
                                config.fromDate.toISOString().slice(0, 10),
                                addDays(config.toDate, 1)
                                    .toISOString()
                                    .slice(0, 10),
                                agentId
                            )
                        ).then((payments) => {
                            let paymentsData: AgentInvoicePayment[] =
                                payments.data;

                            paymentsData = paymentsData.map((payment) => ({
                                ...payment,
                                agentName: agent.data.partnerName,
                            }));

                            // Debug: Log data before sorting
                            console.log('Before sorting:', paymentsData);

                            paymentsData.sort((a, b) => {
                                // Define dateA, prioritizing paymentDate and falling back to createdDate
                                const dateA = a.paymentDate
                                    ? new Date(a.paymentDate).getTime()
                                    : a.createdDate
                                    ? new Date(a.createdDate).getTime()
                                    : -Infinity; // or Infinity if you want to treat null as the latest date
                                // Define dateB, prioritizing paymentDate and falling back to createdDate
                                const dateB = b.paymentDate
                                    ? new Date(b.paymentDate).getTime()
                                    : b.createdDate
                                    ? new Date(b.createdDate).getTime()
                                    : -Infinity; // or Infinity if you want to treat null as the latest date
                                return dateB - dateA;
                            });

                            // Debug: Log data after sorting
                            console.log('After sorting:', paymentsData);

                            this.payments$.next(paymentsData);
                            this.status$.next('success');
                        });
                    }
                }
            );
        } else {
            // TODO: flow for without agentid
            this.userState.getAspNetUser().then((user) => {
                if (user?.companyUniqueID) {
                    lastValueFrom(
                        this.agentService.getAssociatedAgents(
                            user.companyUniqueID,
                            true
                        )
                    ).then((agents) => {
                        if (user?.companyUniqueID) {
                            lastValueFrom(
                                this.agentService.getCompanyPayments(
                                    config.fromDate.toISOString().slice(0, 10),
                                    addDays(config.toDate, 1)
                                        .toISOString()
                                        .slice(0, 10),
                                    user.companyUniqueID
                                )
                            ).then((payments) => {
                                let paymentsData: AgentInvoicePayment[] =
                                    payments.data;

                                paymentsData = paymentsData.map((payment) => ({
                                    ...payment,
                                    agentName: agents.data.find(
                                        (x) => x.partnerId == payment.agentId
                                    )?.partnerName,
                                }));

                                this.payments$.next(paymentsData);
                                this.status$.next('success');
                            });
                        }
                    });
                }
            });
        }
    }

    closePaymentModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            addPayment: {
                isOpen: false,
                context: this.modals$.getValue().addPayment.context,
            },
        });
    }

    openPaymentModal(): void {
        const agentId = this.agentId$.getValue();
        this.modals$.next({
            ...this.modals$.getValue(),
            addPayment: {
                isOpen: true,
                context: {
                    agentId: agentId || null,
                },
            },
        });
    }

    addPayment(payment: AgentInvoicePayment) {
        return lastValueFrom(
            this.agentService
                .saveAgentInvoicePayment(payment)
                .pipe(map((res) => res.success))
        ).catch(() => {
            // TODO: error handling required - for now, assume it returns false
            return Promise.resolve(false);
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }
}
