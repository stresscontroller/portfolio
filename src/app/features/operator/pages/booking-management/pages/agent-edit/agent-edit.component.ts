import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { BadgeModule } from 'primeng/badge';
import { Features, UserState, checkPageAccess } from '@app/core';
import { PermissionDirective } from '@app/shared';
import { AgentEditState } from './state';

@Component({
    standalone: true,
    selector: 'app-agent-edit-page',
    templateUrl: './agent-edit.component.html',
    styleUrls: ['../../../../operator.scss', './agent-edit.component.scss'],
    imports: [CommonModule, RouterModule, BadgeModule, PermissionDirective],
    providers: [AgentEditState],
})
export class AgentEditComponent {
    userState = inject(UserState);
    agentEditState = inject(AgentEditState);
    activatedRoute = inject(ActivatedRoute);
    features = Features;
    private destroyed$ = new Subject<void>();

    bookingManagementAgentEditNavOptions$: Observable<
        {
            displayName: string;
            path: string;
            badge?: number;
        }[]
    > = this.userState.controls$.pipe(
        map((featureControls) => {
            return [
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagementAgentEdit.name,
                    Features.bookingManagementAgentEdit.pages.account.name
                )
                    ? [
                          {
                              displayName: 'Account',
                              path: './account',
                          },
                      ]
                    : []),

                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagementAgentEdit.name,
                    Features.bookingManagementAgentEdit.pages.bookings.name
                )
                    ? [
                          {
                              displayName: 'Bookings',
                              path: './bookings',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagementAgentEdit.name,
                    Features.bookingManagementAgentEdit.pages.statements.name
                )
                    ? [
                          {
                              displayName: 'Statements',
                              path: './statements',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagementAgentEdit.name,
                    Features.bookingManagementAgentEdit.pages.payments.name
                )
                    ? [
                          {
                              displayName: 'Payments',
                              path: './payments',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.bookingManagementAgentEdit.name,
                    Features.bookingManagementAgentEdit.pages.agreements.name
                )
                    ? [
                          {
                              displayName: 'Agreements',
                              path: './agreements',
                          },
                      ]
                    : []),
            ];
        })
    );

    ngOnInit(): void {
        this.agentEditState.init();
        this.activatedRoute.paramMap
            .pipe(takeUntil(this.destroyed$))
            .subscribe((param) => {
                const editAgentId = param.get('id');
                if (editAgentId) {
                    this.agentEditState.setEditAgentId(editAgentId);
                } else {
                    this.agentEditState.clearEditAgentId();
                }
            });
    }
}
