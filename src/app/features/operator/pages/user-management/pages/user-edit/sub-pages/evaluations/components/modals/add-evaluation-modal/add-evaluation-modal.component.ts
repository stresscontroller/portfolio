import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { UserEvaluationsState, UIState } from '../../../state';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import {
    FileSelectEvent,
    FileUpload,
    FileUploadModule,
} from 'primeng/fileupload';
import { OperatorFiltersState, UIStatus } from '@app/core';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    standalone: true,
    selector: 'app-add-evaluation-modal',
    templateUrl: './add-evaluation-modal.component.html',
    styleUrls: ['./add-evaluation-modal.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        DropdownModule,
        CheckboxModule,
        CalendarModule,
        FileUploadModule,
    ],
    providers: [],
})
export class AddEvaluationModalComponent {
    @ViewChild('fileUploadComponent', { static: false })
    fileUploadComponent: FileUpload | undefined;

    uiState = inject(UIState);
    userEvaluationsState = inject(UserEvaluationsState);
    operatorFiltersState = inject(OperatorFiltersState);

    status$ = new BehaviorSubject<UIStatus>('idle');

    addUserEvaluationModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.addEvaluation),
        distinctUntilChanged()
    );

    isOpen$ = this.addUserEvaluationModal$.pipe(map((modal) => modal.isOpen));

    addUserEvaluationForm = new FormGroup({
        evaluationType: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        fromDate: new FormControl<Date | null>(null),
    });

    evaluations$ = this.operatorFiltersState.evaluations$;
    fileToUpload: File | undefined = undefined;

    ngOnInit(): void {
        this.operatorFiltersState.loadQualificationData();
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
        this.addUserEvaluationForm.reset();

        this.uiState.closeAddEvaluationModal();
    }

    save(): void {
        if (this.addUserEvaluationForm.invalid || !this.fileToUpload) {
            Object.values(this.addUserEvaluationForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.addUserEvaluationForm.getRawValue();
        this.userEvaluationsState
            .saveEvaluations({
                userEvaluationCoachingId: 0,
                formFile: this.fileToUpload,
                formPath: 'Formpath',
                isActive: true,
                fromDate: formValues.fromDate
                    ? formatDate(
                          new Date(formValues.fromDate),
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
