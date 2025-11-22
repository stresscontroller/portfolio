import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { Agent, Features } from '@app/core';
import { AgentState } from './agents.state';
import { DisableAgentModalComponent } from './modals/disable-agent.component';

// TODO: this has to be moved to within this directory since its not used elsewhere

@Component({
    standalone: true,
    selector: 'app-agents',
    templateUrl: './agents.component.html',
    styleUrls: ['./agents.component.scss'],
    imports: [
        FormsModule,
        CommonModule,
        RouterModule,
        TableModule,
        InputSwitchModule,
        InputTextModule,
        ButtonModule,
        DividerModule,
        LoaderEmbedComponent,
        PermissionDirective,
        DisableAgentModalComponent,
    ],
    providers: [AgentState],
})
export class AgentsComponent {
    @ViewChild('agentsTable', { static: false }) agentsTable: Table | undefined;
    keyword: string = '';

    features = Features;
    editUserFeatures = Object.values(Features.userManagementEdit.pages).map(
        (page) => ({
            feature: Features.userManagementEdit.name,
            page: page.name,
        })
    );
    // TODO: investigate this
    displayActionColumn = [
        ...this.editUserFeatures,

        {
            feature: Features.userManagement.name,
            page: Features.userManagement.pages.userList.name,
            pageFeature: [
                Features.userManagement.pages.userList.features.userDelete.name,
            ],
        },
    ];
    agentState = inject(AgentState);
    agents$ = this.agentState.agents$;
    status$ = this.agentState.status$;
    isActive = false;

    ngOnInit(): void {
        this.agentState.init();
    }

    isActiveChange(): void {
        this.agentState.setFilter(!this.isActive);
    }

    openAddNewAgentModal(): void {
        this.agentState.openAddNewAgentModal();
    }

    search(): void {
        if (this.agentsTable) {
            this.agentsTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openSetAgentInactiveModal(agent: Agent): void {
        if (!agent) {
            return;
        }
        this.agentState.openSetAgentInactiveModal(agent);
    }
}
