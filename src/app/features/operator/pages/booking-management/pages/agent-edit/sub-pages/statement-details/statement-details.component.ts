import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { BehaviorSubject, map, shareReplay, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { CalendarModule } from 'angular-calendar';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Features } from '@app/core';
import {
    StatementDetailsState,
    ViewStatementConfig,
} from './statement-details.state';

@Component({
    standalone: true,
    selector: 'app-view-statement-details',
    templateUrl: './statement-details.component.html',
    styleUrls: ['./statement-details.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        TableModule,
        InputSwitchModule,
        InputTextModule,
        ButtonModule,
        DividerModule,
        LoaderEmbedComponent,
        PermissionDirective,
        CalendarModule,
        FloatLabelModule,
        StatementDetailsComponent,
        DialogModule,
    ],
    providers: [StatementDetailsState],
})
export class StatementDetailsComponent {
    features = Features;
    router = inject(Router);
    route = inject(ActivatedRoute);
    statementDetailsState = inject(StatementDetailsState);
    viewStatements$ = this.statementDetailsState.viewStatements$;
    statementSummary$ = this.statementDetailsState.statementSummary$;
    activatedRoute = inject(ActivatedRoute);
    viewStatementConfig$ = this.activatedRoute.queryParams.pipe(
        map((queryParams) => {
            const config = queryParams['config'];
            try {
                if (config) {
                    return JSON.parse(atob(config)) as ViewStatementConfig;
                } else {
                    return undefined;
                }
            } catch (err) {
                return undefined;
            }
        }),
        shareReplay()
    );

    status$ = this.statementDetailsState.viewStatus$;
    destroyed$ = new Subject<void>();
    context$ = new BehaviorSubject<{
        year: number;
        refreshTriggered: number;
    }>({
        year: new Date().getFullYear(),
        refreshTriggered: 0,
    });

    ngOnInit(): void {
        this.statementDetailsState.init();

        this.viewStatementConfig$
            .pipe(takeUntil(this.destroyed$))
            .subscribe((config) => {
                this.statementDetailsState.updateViewStatementConfig(config);
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onExport(
        context?:
            | {
                  startDate: string;
                  endDate: string;
                  agentId: number;
                  month: string;
                  year: number;
              }
            | undefined
    ): void {
        this.statementDetailsState.exportExcel(context);
    }

    viewBooking(reservationBookingId: string) {
        if (reservationBookingId != null && reservationBookingId != '') {
            this.router.navigate([`../../bookings/${reservationBookingId}`], {
                relativeTo: this.route,
            });
        }
    }

    close(): void {
        this.status$.next('idle');
    }
}
