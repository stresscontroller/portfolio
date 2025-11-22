import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import {
    Agent,
    AgentApiService,
    ErrorDialogMessages,
    UIState,
    UIStatus,
    UserState,
} from '@app/core';

@Injectable()
export class AgentState {
    userState = inject(UserState);
    uiState = inject(UIState);
    agentApiService = inject(AgentApiService);

    agents$ = new BehaviorSubject<Agent[]>([]);
    status$ = new BehaviorSubject<UIStatus>('idle');

    modals$ = new BehaviorSubject<{
        addNewAgent: {
            isOpen: boolean;
        };
        setAgentInactive: {
            isOpen: boolean;
            context?: Agent;
        };
    }>({
        addNewAgent: {
            isOpen: false,
        },
        setAgentInactive: {
            isOpen: false,
        },
    });

    config$ = new BehaviorSubject<{
        isActive: boolean;
        refreshTriggered: number;
    }>({
        isActive: true,
        refreshTriggered: 0,
    });

    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        this.config$.subscribe((config) => {
            this.loadAgents(config.isActive);
        });
    }

    loadAgents(isActive: boolean): Promise<void> {
        this.agents$.next([]);
        this.status$.next('loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (user?.companyUniqueID) {
                    return lastValueFrom(
                        this.agentApiService.getAssociatedAgents(
                            user.companyUniqueID,
                            isActive
                        )
                    ).then((res) => {
                        return Promise.resolve(res.data);
                    });
                }
                return Promise.reject('missing agent information');
            })
            .then((agents) => {
                this.status$.next('success');
                this.agents$.next(agents);
                return Promise.resolve();
            })
            .catch((error) => {
                this.status$.next('error');
                this.uiState.openErrorDialog({
                    //TODO: Update the errors
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
                // swallow error
                return Promise.resolve();
            });
    }

    openAddNewAgentModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            addNewAgent: {
                isOpen: true,
            },
        });
    }

    openSetAgentInactiveModal(context: Agent): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            setAgentInactive: {
                isOpen: true,
                context,
            },
        });
    }

    closeSetAgentInactiveModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            setAgentInactive: {
                isOpen: false,
            },
        });
    }

    setAgentInactive(agent: Agent): Promise<void> {
        const partnerId = agent.partnerId;
        if (!partnerId) {
            return Promise.reject('no partnerId');
        }
        return lastValueFrom(
            this.agentApiService.saveAgentDetails({
                ...agent,
                isActive: false,
            })
        ).then(() => {
            this.refresh();
            return Promise.resolve();
        });
    }

    setFilter(isActive: boolean): void {
        this.config$.next({
            ...this.config$.getValue(),
            isActive,
        });
    }

    refresh(): void {
        this.config$.next({
            ...this.config$.getValue(),
            refreshTriggered: new Date().getTime(),
        });
    }
}
