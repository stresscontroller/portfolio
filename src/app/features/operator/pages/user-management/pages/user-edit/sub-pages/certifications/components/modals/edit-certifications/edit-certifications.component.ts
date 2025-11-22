import { Component, ViewChild, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import {
    BehaviorSubject,
    Subject,
    combineLatest,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { UIState, CertificationsState } from '../../../state';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import {
    OperatorFiltersState,
    UserManagementApiService,
    UIStatus,
    Qualification,
} from '@app/core';
import {
    FileSelectEvent,
    FileUpload,
    FileUploadModule,
} from 'primeng/fileupload';

@Component({
    standalone: true,
    selector: 'app-edit-certifications-modal',
    templateUrl: './edit-certifications.component.html',
    styleUrls: ['./edit-certifications.component.scss'],
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
export class EditCertificationModalComponent {
    uiState = inject(UIState);
    userManagementApiService = inject(UserManagementApiService);
    certificationsState = inject(CertificationsState);
    operatorFiltersState = inject(OperatorFiltersState);

    @ViewChild('fileUploadComponent', { static: false })
    fileUploadComponent: FileUpload | undefined;

    editCertifications$ = this.uiState.modals$.pipe(
        map((modals) => modals.editCertifications),
        distinctUntilChanged()
    );
    qualifications$ = this.operatorFiltersState.qualifications$;
    isOpen$ = this.editCertifications$.pipe(map((modal) => modal.isOpen));
    context$ = this.editCertifications$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    certificationsStatusForm = new FormGroup({
        certificationType: new FormControl<Qualification | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        startDate: new FormControl<Date | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        expiryDate: new FormControl<Date | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        noExpiryDate: new FormControl(false),
    });
    certificationData$ = this.editCertifications$.pipe(
        map((data) => data.context)
    );
    fileToUpload: File | undefined = undefined;
    private userQualificationLicenseId: number | undefined = undefined;
    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.operatorFiltersState.loadQualificationData();
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeEditCertificationsModal();
        this.certificationsStatusForm.reset();
        this.userQualificationLicenseId = undefined;
        this.fileToUpload = undefined;
        if (this.fileUploadComponent) {
            this.fileUploadComponent.clear();
        }
    }

    onFileSelect(event: FileSelectEvent): void {
        const selectedFile = event.files[0];
        if (selectedFile) {
            this.fileToUpload = selectedFile;
        }
    }

    updateCertification() {
        if (
            this.certificationsStatusForm.invalid ||
            !this.userQualificationLicenseId
        ) {
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
            'UserQualificationLicenseId',
            this.userQualificationLicenseId.toString()
        );

        formData.append(
            'displayName',
            formValues.certificationType?.qualificationName || ''
        );
        formData.append('TypeName', 'Certification');
        formData.append(
            'TypeId',
            formValues.certificationType?.qualificationId.toString() || ''
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

    private setupForm(): void {
        this.certificationsStatusForm.controls.noExpiryDate.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((noExpiryDate) => {
                if (noExpiryDate) {
                    this.certificationsStatusForm.controls.expiryDate.disable();
                    this.certificationsStatusForm.controls.expiryDate.setValidators(
                        [Validators.required]
                    );
                } else {
                    this.certificationsStatusForm.controls.expiryDate.enable();
                    this.certificationsStatusForm.controls.expiryDate.clearValidators();
                }
                this.certificationsStatusForm.updateValueAndValidity();
            });
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return combineLatest([
                        this.certificationData$.pipe(
                            distinctUntilChanged((prev, curr) => {
                                return (
                                    JSON.stringify(prev) ===
                                    JSON.stringify(curr)
                                );
                            })
                        ),
                        this.qualifications$,
                    ]);
                })
            )
            .subscribe(([certificationData, qualifications]) => {
                if (certificationData && qualifications) {
                    this.userQualificationLicenseId =
                        certificationData.userQualificationLicenseId;
                    this.certificationsStatusForm.patchValue({
                        certificationType:
                            qualifications.find(
                                (qualification) =>
                                    qualification.qualificationId ===
                                    certificationData.typeId
                            ) || null,
                        startDate: new Date(certificationData.fromDate),
                        expiryDate: new Date(certificationData.expireDate),
                        noExpiryDate: certificationData.isNeverExpire,
                    });
                }
            });
    }
}
