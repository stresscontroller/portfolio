import { Component, ViewChild, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { UIState, CertificationsState } from '../../../state';
import {
    map,
    distinctUntilChanged,
    BehaviorSubject,
    takeUntil,
    Subject,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import {
    UserManagementApiService,
    OperatorFiltersState,
    UserCertificationsData,
    UIStatus,
    dateRangeValidator,
} from '@app/core';
import {
    FileSelectEvent,
    FileUpload,
    FileUploadModule,
} from 'primeng/fileupload';

@Component({
    standalone: true,
    selector: 'app-add-new-certifications-modal',
    templateUrl: './add-new-certifications.component.html',
    styleUrls: ['./add-new-certifications.component.scss'],
    imports: [
        ReactiveFormsModule,
        DialogModule,
        CommonModule,
        DividerModule,
        DropdownModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        FileUploadModule,
    ],
})
export class AddNewCertificationsModalComponent {
    uiState = inject(UIState);
    userManagementApiService = inject(UserManagementApiService);
    certificationsState = inject(CertificationsState);
    operatorFiltersState = inject(OperatorFiltersState);

    @ViewChild('fileUploadComponent', { static: false })
    fileUploadComponent: FileUpload | undefined;

    addNewCertifications$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewCertifications),
        distinctUntilChanged()
    );
    userCertifications$ = this.operatorFiltersState.userCertifications$;
    qualifications$ = this.operatorFiltersState.qualifications$;

    isOpen$ = this.addNewCertifications$.pipe(map((modal) => modal.isOpen));

    status$ = new BehaviorSubject<UIStatus>('idle');
    certificationsStatusForm = new FormGroup(
        {
            certificationType: new FormControl<UserCertificationsData | null>(
                null,
                {
                    validators: [Validators.required],
                    nonNullable: true,
                }
            ),
            startDate: new FormControl<Date | null>(null, {
                validators: [Validators.required],
                nonNullable: true,
            }),
            expiryDate: new FormControl<Date | null>(null, {
                validators: [Validators.required],
                nonNullable: true,
            }),
            noExpiryDate: new FormControl(false),
        },
        {
            validators: dateRangeValidator('startDate', 'expiryDate'),
        }
    );
    fileToUpload: File | undefined = undefined;
    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.operatorFiltersState.loadQualificationData();
        this.certificationsStatusForm.controls.noExpiryDate.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((noExpiryDate) => {
                if (noExpiryDate) {
                    this.certificationsStatusForm.controls.expiryDate.disable();
                    this.certificationsStatusForm.controls.expiryDate.setValidators(
                        [Validators.required]
                    );
                    this.certificationsStatusForm.clearValidators();
                    this.certificationsStatusForm.updateValueAndValidity();
                } else {
                    this.certificationsStatusForm.controls.expiryDate.enable();
                    this.certificationsStatusForm.controls.expiryDate.clearValidators();
                    this.certificationsStatusForm.setValidators(
                        dateRangeValidator('startDate', 'expiryDate')
                    );
                    this.certificationsStatusForm.updateValueAndValidity();
                }
                this.certificationsStatusForm.updateValueAndValidity();
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onFileSelect(event: FileSelectEvent): void {
        const selectedFile = event.files[0];
        if (selectedFile) {
            this.fileToUpload = selectedFile;
        }
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeAddNewCertificationsModal();
        this.certificationsStatusForm.reset();
        this.fileToUpload = undefined;

        if (this.fileUploadComponent) {
            this.fileUploadComponent.clear();
        }
    }

    addCertification(): void {
        if (this.certificationsStatusForm.invalid) {
            Object.values(this.certificationsStatusForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.certificationsStatusForm.getRawValue();
        const formData = new FormData();
        if (this.fileToUpload) {
            formData.append(
                'DocumentFile',
                this.fileToUpload,
                this.fileToUpload.name
            );
            formData.append('DocumentPath', this.fileToUpload.name);
        }

        formData.append(
            'displayName',
            formValues.certificationType?.qualificationName || ''
        );
        formData.append('TypeName', 'Certification');
        formData.append(
            'TypeId',
            formValues.certificationType?.qualificationId || ''
        );
        formData.append('FromDate', formValues.startDate?.toISOString() || '');
        formData.append(
            'ExpireDate',
            formValues.expiryDate?.toISOString() || ''
        );
        formData.append(
            'IsNeverExpire',
            formValues.noExpiryDate ? 'true' : 'false'
        );
        formData.append('IsActive', 'true');
        formData.append('CreateDate', new Date().toISOString());
        formData.append('ModifiedDate', new Date().toISOString());

        this.certificationsState
            .saveQualification(formData)
            .then(() => {
                this.certificationsState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
