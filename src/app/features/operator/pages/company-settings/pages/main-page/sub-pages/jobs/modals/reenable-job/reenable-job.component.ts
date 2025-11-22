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
import { Job, UIStatus } from '@app/core';
import { JobsState } from '../../jobs.state';

@Component({
    standalone: true,
    selector: 'app-reenable-job-modal',
    templateUrl: './reenable-job.component.html',
    styleUrls: ['./reenable-job.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RadioButtonModule,
        ButtonModule,
        DialogModule,
    ],
})
export class ReenableJobModalComponent {
    jobsState = inject(JobsState);

    reenableJobModal$ = this.jobsState.modals$.pipe(
        map((modals) => modals.reenableJob),
        distinctUntilChanged()
    );

    isOpen$ = this.reenableJobModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.reenableJobModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    destroyed$ = new Subject<void>();

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    setInactive(job: Job): void {
        if (!job) {
            return;
        }
        this.status$.next('loading');
        this.jobsState
            .setJobInactive(job, true)
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
        this.jobsState.closeReenableJobModal();
    }
}
