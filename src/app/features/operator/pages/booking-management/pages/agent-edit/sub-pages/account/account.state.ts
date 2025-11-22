import { Injectable, inject } from '@angular/core';
import {
    UserManagementApiService,
    UserApiService,
    ApiPermissionsControlService,
    AgentApiService,
    UIStatus,
    Agent,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { AgentEditState } from '../../state';

@Injectable()
export class AccountState {
    userManagementApiService = inject(UserManagementApiService);
    apiPermissionsControlService = inject(ApiPermissionsControlService);
    agentApiService = inject(AgentApiService);
    agentEditState = inject(AgentEditState);
    userApiService = inject(UserApiService);

    status$ = new BehaviorSubject<{
        saveAgent: UIStatus;
    }>({
        saveAgent: 'idle',
    });

    saveAgentInfo(agentDetails: Agent): Promise<void> {
        this.updateStatus('saveAgent', 'loading');
        const agentId = this.agentEditState.editAgentId$.getValue();
        if (!agentId) {
            return Promise.reject('no edit agent id');
        }
        return lastValueFrom(
            this.agentApiService.saveAgentDetails({
                ...agentDetails,
            })
        )
            .then((res) => {
                if (!res.success) {
                    throw res;
                }
                this.updateStatus('saveAgent', 'success');
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('saveAgent', 'error');
                return Promise.reject(error);
            });
    }

    private updateStatus(statusKey: 'saveAgent', status: UIStatus): void {
        this.status$.next({
            ...this.status$.getValue(),
            [statusKey]: status,
        });
    }
    refresh(): void {
        this.agentEditState.refresh();
    }
}
