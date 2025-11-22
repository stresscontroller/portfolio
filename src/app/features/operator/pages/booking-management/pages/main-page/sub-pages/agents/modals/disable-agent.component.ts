import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    map,
} from 'rxjs';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Agent, UIStatus } from '@app/core';
import { AgentState } from '../agents.state';

@Component({
    standalone: true,
    selector: 'app-disable-agent-modal',
    templateUrl: './disable-agent.component.html',
    styleUrls: ['./disable-agent.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RadioButtonModule,
        ButtonModule,
        DialogModule,
    ],
})
export class DisableAgentModalComponent {
    agentsState = inject(AgentState);

    disableAgentModal$ = this.agentsState.modals$.pipe(
        map((modals) => modals.setAgentInactive),
        distinctUntilChanged()
    );

    isOpen$ = this.disableAgentModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.disableAgentModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    destroyed$ = new Subject<void>();

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    setInactive(agent: Agent): void {
        if (!agent) {
            return;
        }
        this.status$.next('loading');
        this.agentsState
            .setAgentInactive(agent)
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.agentsState.closeSetAgentInactiveModal();
    }
}
