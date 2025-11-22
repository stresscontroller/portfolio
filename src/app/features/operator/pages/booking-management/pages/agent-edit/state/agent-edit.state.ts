import { Injectable, inject } from '@angular/core';
import {
    Agent,
    AgentApiService,
    UIStatus,
    UserManagementApiService,
    UserState,
} from '@app/core';
import {
    BehaviorSubject,
    catchError,
    filter,
    map,
    of,
    switchMap,
    tap,
} from 'rxjs';

@Injectable()
export class AgentEditState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);
    agentApiService = inject(AgentApiService);

    editAgentId$ = new BehaviorSubject<string | undefined>(undefined);
    agentDetails$ = new BehaviorSubject<Agent | undefined>(undefined);
    status$ = new BehaviorSubject<UIStatus>('idle');

    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.editAgentId$
            .pipe(
                tap(() => {
                    this.agentDetails$.next(undefined);
                }),
                filter((agentId) => !!agentId),
                switchMap((agentId) =>
                    this.refreshTriggered$.pipe(
                        switchMap(() => {
                            this.status$.next('loading');
                            if (agentId != null) {
                                return this.agentApiService
                                    .getAgentDetails(+agentId)
                                    .pipe(
                                        map((res) => res?.data),
                                        tap(() => {
                                            this.status$.next('success');
                                        }),
                                        catchError(() => {
                                            this.status$.next('error');
                                            return of(undefined);
                                        })
                                    );
                            }
                            return of(undefined);
                        })
                    )
                )
            )
            .subscribe((agent) => {
                this.agentDetails$.next(agent);
            });
    }

    setEditAgentId(agentId: string): void {
        this.editAgentId$.next(agentId);
    }

    clearEditAgentId(): void {
        this.editAgentId$.next(undefined);
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }
}
