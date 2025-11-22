import { Injectable, inject } from '@angular/core';
import {
    AgentApiService,
    UIState,
    UserState,
    ErrorDialogMessages,
    AgentStatementList,
    UIStatus,
    ApiAdminBookingService,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { AgentEditState } from '../../state';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable()
export class StatementsState {
    router = inject(Router);
    route = inject(ActivatedRoute);

    userState = inject(UserState);
    uiState = inject(UIState);
    agentApiService = inject(AgentApiService);
    adminApiService = inject(ApiAdminBookingService);

    statements$ = new BehaviorSubject<AgentStatementList[]>([]);

    agentEditState = inject(AgentEditState);
    status$ = new BehaviorSubject<UIStatus>('idle');
    viewStatus$ = new BehaviorSubject<UIStatus>('idle');

    editAgentId$ = this.agentEditState.editAgentId$;

    config$ = new BehaviorSubject<{
        year: number;
        refreshTriggered: number;
    }>({
        year: new Date().getFullYear(),
        refreshTriggered: 0,
    });

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        this.config$.subscribe((config) => {
            this.loadStatements(config.year);
        });
    }

    loadStatements(year: number): Promise<void> {
        const agentId = this.editAgentId$.value
            ? parseInt(this.editAgentId$.value)
            : 0;
        this.statements$.next([]);
        this.status$.next('loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (user?.companyUniqueID) {
                    return lastValueFrom(
                        this.agentApiService.getAgentStatementListForYear(
                            agentId,
                            year
                        )
                    ).then((res) => {
                        return Promise.resolve(res.data);
                    });
                }
                return Promise.reject('missing statement information');
            })
            .then((statements) => {
                this.status$.next('success');
                this.statements$.next(statements);
                return Promise.resolve();
            })
            .catch((error) => {
                this.uiState.openErrorDialog({
                    title: error.errorTitle
                        ? error.errorTitle
                        : ErrorDialogMessages.userManagement.loadUserError
                              .title,
                    description:
                        error?.errors &&
                        Array.isArray(error.errors) &&
                        error.errors.length > 0
                            ? error.errors[0]
                            : ErrorDialogMessages.userManagement.loadUserError
                                  .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .loadUserError.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                this.status$.next('error');
                // swallow error
                return Promise.resolve();
            });
    }

    openStatementDetailsPage(
        startDate: string,
        endDate: string,
        agentId: number,
        month: string,
        year: number
    ): void {
        const filter = '';

        const modelToPass: {
            startDate: string;
            endDate: string;
            agentId: number;
            month: string;
            year: number;
        } = {
            startDate,
            endDate,
            agentId,
            month,
            year,
        };

        this.router.navigate(['./details']),
            {
                relativeTo: this.route,
                queryParams: {
                    selected: btoa(JSON.stringify(modelToPass)),
                    filters: btoa(JSON.stringify(filter)),
                },
            };
    }

    setFilter(year: number): void {
        this.config$.next({
            ...this.config$.getValue(),
            year,
        });
    }

    reconcileInvoices(): Promise<void> {
        const agentId = this.editAgentId$.value
            ? parseInt(this.editAgentId$.value)
            : 0;

        this.status$.next('loading');

        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (user?.companyUniqueID) {
                    return lastValueFrom(
                        this.adminApiService.settleAgentInvoice({ agentId })
                    ).then((res) => {
                        return Promise.resolve(res.data);
                    });
                }
                return Promise.reject('missing statement information');
            })
            .then(() => {
                this.status$.next('success');
                this.refresh();
                return Promise.resolve();
            })
            .catch((error) => {
                this.uiState.openErrorDialog({
                    title: error.errorTitle
                        ? error.errorTitle
                        : ErrorDialogMessages.userManagement.loadUserError
                              .title,
                    description:
                        error?.errors &&
                        Array.isArray(error.errors) &&
                        error.errors.length > 0
                            ? error.errors[0]
                            : ErrorDialogMessages.userManagement.loadUserError
                                  .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .loadUserError.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                this.status$.next('error');
                // swallow error
                return Promise.resolve();
            });
    }

    refresh(): void {
        this.config$.next({
            ...this.config$.getValue(),
            refreshTriggered: new Date().getTime(),
        });
    }
}
