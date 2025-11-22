import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { BehaviorSubject, distinctUntilChanged, map, take } from 'rxjs';
import { AssignmentsState, UIState } from '../../../state';
import { UIStatus } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-share-pdf',
    templateUrl: './share-pdf.component.html',
    styleUrls: ['./share-pdf.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
    ],
})
export class SharePdfComponent {
    assignmentState = inject(AssignmentsState);
    uiState = inject(UIState);

    emailPdf = new FormGroup({
        email: new FormControl('', {
            validators: [Validators.required],
            nonNullable: true,
        }),
    });

    sharePdfModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.sharePDF),
        distinctUntilChanged()
    );

    isOpen$ = this.sharePdfModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.sharePdfModal$.pipe(map((modal) => modal.context));

    status$ = new BehaviorSubject<UIStatus>('idle');

    close(): void {
        this.status$.next('idle');
        this.uiState.closeSharePDFModal();
    }

    save(): void {
        if (this.emailPdf.invalid) {
            Object.values(this.emailPdf.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        this.context$.pipe(take(1)).subscribe((context) => {
            this.status$.next('loading');
            if (context) {
                this.assignmentState
                    .shareAssignmentPdf(
                        this.emailPdf.getRawValue().email,
                        context
                    )
                    .then(() => {
                        this.status$.next('success');
                    })
                    .catch(() => {
                        this.status$.next('error');
                    });
            }
        });
    }
}
