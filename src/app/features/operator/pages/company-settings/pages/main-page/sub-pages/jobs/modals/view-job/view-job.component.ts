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
import { UIStatus } from '@app/core';
import { JobsState } from '../../jobs.state';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
    standalone: true,
    selector: 'app-view-job-modal',
    templateUrl: './view-job.component.html',
    styleUrls: ['./view-job.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RadioButtonModule,
        ButtonModule,
        DialogModule,
        ScrollPanelModule,
    ],
})
export class ViewJobModalComponent {
    jobsState = inject(JobsState);

    viewJobModal$ = this.jobsState.modals$.pipe(
        map((modals) => modals.viewJob),
        distinctUntilChanged()
    );

    isOpen$ = this.viewJobModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.viewJobModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    department$ = this.viewJobModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.department)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    destroyed$ = new Subject<void>();

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.jobsState.closeViewJobModal();
    }
}
