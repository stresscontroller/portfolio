import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Features } from '@app/core';
import { StatementsState } from './statements.state';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { FloatLabelModule } from 'primeng/floatlabel';

interface ViewStatementConfig {
    startDate: string;
    endDate: string;
    agentId: number;
    month: string;
    year: number;
}

@Component({
    standalone: true,
    selector: 'app-statements',
    templateUrl: './statements.component.html',
    styleUrls: ['./statements.component.scss'],
    providers: [StatementsState],
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
    ],
})
export class StatementsComponent {
    router = inject(Router);
    route = inject(ActivatedRoute);

    features = Features;
    statementState = inject(StatementsState);
    statements$ = this.statementState.statements$;
    status$ = this.statementState.status$;
    year = new Date();

    ngOnInit(): void {
        this.statementState.init();
    }

    yearChange(): void {
        this.statementState.setFilter(this.year.getFullYear());
    }

    currentDateValueOf(): number {
        return new Date().valueOf();
    }

    getDateValueOf(date: string): number {
        if (!date) {
            return 1;
        }
        const dateToReturn = new Date(date);
        return dateToReturn.valueOf();
    }

    getOverdueString(date: string): string {
        const today = new Date();
        const parsedDate = new Date(date);
        const diffInDays = Math.floor(
            (today.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffInDays >= 90) {
            return '90+ Days Past Due';
        } else if (diffInDays >= 60) {
            return '60 Days Past Due';
        } else if (diffInDays >= 30) {
            return '30 Days Past Due';
        } else if (diffInDays > 0) {
            return 'Due';
        } else {
            return 'Not overdue';
        }
    }

    openViewStatementPage(
        startDate: string,
        endDate: string,
        agentId: number,
        month: string,
        year: number
    ): void {
        const filter = '';

        if (!startDate || !endDate) {
            return;
        }

        const config: ViewStatementConfig = {
            startDate,
            endDate,
            agentId,
            month,
            year,
        };

        this.router.navigate(['./details'], {
            relativeTo: this.route,
            queryParams: {
                config: btoa(JSON.stringify(config)),
                filters: btoa(JSON.stringify(filter)),
            },
        });
    }

    reconcileInvoices(): void {
        this.statementState.reconcileInvoices();
    }
}
