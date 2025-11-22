import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { Table, TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { JobsState } from './jobs.state';
import { Features, Job } from '@app/core';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DividerModule } from 'primeng/divider';
import { DisableJobModalComponent } from './modals/disable-job/disable-job.component';
import { ViewJobModalComponent } from './modals/view-job/view-job.component';
import { ViewApplicantsModalComponent } from './modals/view-applicants/view-applicants.component';
import { ReenableJobModalComponent } from './modals/reenable-job/reenable-job.component';

@Component({
    standalone: true,
    selector: 'app-jobs',
    templateUrl: './jobs.component.html',
    styleUrls: ['./jobs.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        LoaderEmbedComponent,
        PermissionDirective,
        TableModule,
        InputTextModule,
        InputSwitchModule,
        DividerModule,
        DisableJobModalComponent,
        ViewJobModalComponent,
        ViewApplicantsModalComponent,
        PermissionDirective,
        ReenableJobModalComponent,
    ],
    providers: [JobsState],
})
export class JobsComponent {
    @ViewChild('jobsTable', { static: false }) jobsTable: Table | undefined;
    keyword: string = '';

    private destroyed$ = new Subject<void>();
    jobState = inject(JobsState);
    jobs$ = this.jobState.jobs$;
    status$ = this.jobState.status$;
    isActive = false;
    features = Features;

    ngOnInit(): void {
        this.jobState.init();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    isActiveChange(): void {
        this.jobState.setFilter(!this.isActive);
    }

    openSetJobInactiveModal(item: Job) {
        this.jobState.openSetJobInactiveModal(item);
    }

    openReenableJobModal(item: Job) {
        this.jobState.openReenableJobModal(item);
    }

    openViewJobModal(item: Job) {
        this.jobState.openViewJobModal(item);
    }

    openViewApplicantsModal(item: Job) {
        this.jobState.openViewApplicantsModal(item);
    }

    search(): void {
        if (this.jobsTable) {
            this.jobsTable.filterGlobal(this.keyword, 'contains');
        }
    }
}
