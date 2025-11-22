import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, filter } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { UIStatus } from '@app/core';
import { UIState, PositionsState } from '../../../state';
@Component({
    standalone: true,
    selector: 'app-post-job-modal',
    templateUrl: './post-job.component.html',
    styleUrls: ['./post-job.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        CheckboxModule,
        InputTextareaModule,
    ],
})
export class PostJobModalComponent {
    uiState = inject(UIState);
    positionsState = inject(PositionsState);
    postJob$ = this.uiState.modals$.pipe(
        map((modals) => modals.postJob),
        distinctUntilChanged()
    );
    isOpen$ = this.postJob$.pipe(map((modal) => modal.isOpen));
    context$ = this.postJob$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    positionDetail$ = this.positionsState.positionDetails$;

    ngOnInit(): void {
        this.context$.subscribe((context) => {
            if (context) {
                this.positionsState.getPositionDetail(context);
            }
        });
    }

    post(positionId: number): void {
        this.status$.next('loading');
        this.positionsState
            .deletePosition(positionId, false)
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
        this.uiState.closePostJobModal();
    }
}
