import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { UserEvaluationsState, UIState } from '../../../state';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import {
    OperatorFiltersState,
    UIStatus,
    UserEvaluationsListItem,
    adjustDate,
} from '@app/core';
import {
    FileSelectEvent,
    FileUpload,
    FileUploadModule,
} from 'primeng/fileupload';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    standalone: true,
    selector: 'app-edit-evaluation-modal',
    templateUrl: './edit-evaluation-modal.component.html',
    styleUrls: ['./edit-evaluation-modal.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        DropdownModule,
        CalendarModule,
        CheckboxModule,
        FileUploadModule,
    ],
})
export class EditEvaluationModalComponent {
    @ViewChild('fileUploadComponent', { static: false })
    fileUploadComponent: FileUpload | undefined;

    uiState = inject(UIState);
    userEvaluationsState = inject(UserEvaluationsState);
    operatorFiltersState = inject(OperatorFiltersState);

    editUserEvaluationModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editEvaluation),
        distinctUntilChanged()
    );

    isOpen$ = this.editUserEvaluationModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.editUserEvaluationModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    editUserEvaluationForm = new FormGroup({
        evaluationType: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        isActive: new FormControl<boolean | null>(null),
        formDate: new FormControl<Date | null>(null),
    });

    evaluations$ = this.operatorFiltersState.evaluations$;
    fileToUpload: File | undefined = undefined;
    status$ = new BehaviorSubject<UIStatus>('idle');
    private userEvaluation: UserEvaluationsListItem | undefined = undefined;

    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.setupForm();
    }

    onFileSelect(event: FileSelectEvent): void {
        const selectedFile = event.files[0];
        if (selectedFile) {
            this.fileToUpload = selectedFile;
        }
    }

    close(): void {
        if (this.fileUploadComponent) {
            this.fileUploadComponent.clear();
        }
        this.fileToUpload = undefined;
        this.editUserEvaluationForm.reset();

        this.uiState.closeEditEvaluationModal();
    }

    private async setupForm() {
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return this.context$.pipe(
                        distinctUntilChanged((prev, curr) => {
                            return (
                                JSON.stringify(prev) === JSON.stringify(curr)
                            );
                        }),
                        takeUntil(this.destroyed$)
                    );
                })
            )
            .subscribe((evaluation) => {
                this.userEvaluation = evaluation;
                if (evaluation) {
                    this.editUserEvaluationForm.patchValue({
                        evaluationType: evaluation.type,
                        formDate: evaluation.formDate
                            ? adjustDate(new Date(evaluation.formDate))
                            : new Date(),
                        isActive: evaluation.isActive,
                    });
                }
            });
    }

    save(): void {
        if (
            this.editUserEvaluationForm.invalid ||
            !this.userEvaluation?.userEvaluationCoachingId
        ) {
            Object.values(this.editUserEvaluationForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.editUserEvaluationForm.getRawValue();
        this.userEvaluationsState
            .saveEvaluations({
                userEvaluationCoachingId:
                    this.userEvaluation?.userEvaluationCoachingId,
                formFile: this.fileToUpload,
                formPath: 'Formpath',
                isActive: formValues.isActive || false,
                fromDate: formValues.formDate
                    ? formatDate(
                          new Date(formValues.formDate),
                          'YYYY-MM-dd',
                          'en-US'
                      )
                    : '',
                type: formValues.evaluationType || '',
                userId: '',
                companyId: '',
            })
            .then(() => {
                this.status$.next('idle');
                this.userEvaluationsState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
