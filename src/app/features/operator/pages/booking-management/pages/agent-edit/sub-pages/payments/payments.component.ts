import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Features } from '@app/core';
import { PaymentsComponent as SharedPaymentsComponent } from '../../../../components';
import { AgentEditState } from '../../state';
@Component({
    standalone: true,
    selector: 'app-agent-payments',
    templateUrl: './payments.component.html',
    imports: [CommonModule, SharedPaymentsComponent],
})
export class PaymentsComponent {
    features = Features;
    agentEditState = inject(AgentEditState);
    agentId$ = this.agentEditState.editAgentId$;
}
