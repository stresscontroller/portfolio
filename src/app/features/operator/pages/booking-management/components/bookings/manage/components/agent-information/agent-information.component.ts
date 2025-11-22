import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { map, Subject, takeUntil } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { AgentUser, OperatorFiltersState } from '@app/core';
import { PermissionConfig, PermissionDirective } from '@app/shared';
import { ManageService } from '../../manage.service';

@Component({
    standalone: true,
    selector: 'app-agent-information',
    templateUrl: './agent-information.component.html',
    styleUrls: ['./agent-information.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DropdownModule,
        PermissionDirective,
    ],
})
export class AgentInformationComponent {
    @Input() updatePermission?: PermissionConfig;
    manageService = inject(ManageService);
    operatorFiltersState = inject(OperatorFiltersState);
    lastModifiedBy$ = this.manageService.booking$.pipe(
        map((bookings) => {
            // default to the first one
            return (
                bookings?.[0].originalBookingDetails?.lastModifiedBy ?? ''
            ).trim();
        })
    );

    agentUsers$ = this.operatorFiltersState.agentUsers$;
    agentInfoForm = new FormGroup({
        agent: new FormControl<AgentUser | null>(null, Validators.required),
    });

    private readonly isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.operatorFiltersState.getAgentUsers().then((agents) => {
            this.manageService.bookingGeneralInfo$
                .pipe(takeUntil(this.isDestroyed$))
                .subscribe((res) => {
                    if (res) {
                        this.agentInfoForm.patchValue(
                            {
                                agent:
                                    agents.find(
                                        (a) => a.partnerId === res.partnerId
                                    ) || null,
                            },
                            { emitEvent: false }
                        );
                    }
                });
        });
        this.agentInfoForm.valueChanges
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((res) => {
                this.manageService.updateAgentInformation(
                    res.agent?.partnerId || null
                );
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next(undefined);
        this.isDestroyed$.complete();
    }
}
