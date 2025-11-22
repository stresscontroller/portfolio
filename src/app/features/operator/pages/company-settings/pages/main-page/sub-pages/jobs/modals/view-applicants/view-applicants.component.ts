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
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';

@Component({
    standalone: true,
    selector: 'app-view-applicants-modal',
    templateUrl: './view-applicants.component.html',
    styleUrls: ['./view-applicants.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RadioButtonModule,
        ButtonModule,
        DialogModule,
        ScrollPanelModule,
        DividerModule,
        TableModule,
    ],
})
export class ViewApplicantsModalComponent {
    jobsState = inject(JobsState);

    viewApplicantsModal$ = this.jobsState.modals$.pipe(
        map((modals) => modals.viewApplicants),
        distinctUntilChanged()
    );

    isOpen$ = this.viewApplicantsModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.viewApplicantsModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    applicants$ = this.viewApplicantsModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.applicants)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    destroyed$ = new Subject<void>();

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.jobsState.closeViewApplicantsModal();
    }
}
