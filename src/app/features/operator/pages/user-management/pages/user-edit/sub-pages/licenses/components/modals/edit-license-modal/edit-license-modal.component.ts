import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SpecialLicensesState, UIState } from '../../../state';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
    combineLatest,
    take,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { UIStatus } from '@app/core';
import {
    FileSelectEvent,
    FileUpload,
    FileUploadModule,
} from 'primeng/fileupload';

@Component({
    standalone: true,
    selector: 'app-edit-license-modal',
    templateUrl: './edit-license-modal.component.html',
    styleUrls: ['./edit-license-modal.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        DropdownModule,
        CalendarModule,
        FileUploadModule,
        CheckboxModule,
    ],
})
export class EditLicenseModalComponent {
    uiState = inject(UIState);
    specialLicensesState = inject(SpecialLicensesState);

    @ViewChild('fileUploadComponent', { static: false })
    fileUploadComponent: FileUpload | undefined;

    editSpecialLicenseModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editLicense),
        distinctUntilChanged()
    );

    isOpen$ = this.editSpecialLicenseModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.editSpecialLicenseModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    licenseOptions$ = this.specialLicensesState.licenseOptions$;
    status$ = new BehaviorSubject<UIStatus>('idle');

    editSpecialLicenseForm = new FormGroup({
        licenseType: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        fromDate: new FormControl<Date | null>(null, [Validators.required]),
        expiryDate: new FormControl<Date | null>(null, [Validators.required]),
        noExpiryDate: new FormControl(false),
    });

    savedLicenseInfo$ = this.editSpecialLicenseModal$.pipe(
        map((data) => data.context)
    );
    fileToUpload: File | undefined = undefined;
    private userSpecialLicenseId: number | undefined = undefined;
    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setupForm();
        this.editSpecialLicenseForm.controls.noExpiryDate.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((noExpiryDate) => {
                if (noExpiryDate) {
                    this.editSpecialLicenseForm.controls.expiryDate.disable();
                    this.editSpecialLicenseForm.controls.expiryDate.setValidators(
                        [Validators.required]
                    );
                } else {
                    this.editSpecialLicenseForm.controls.expiryDate.enable();
                    this.editSpecialLicenseForm.controls.expiryDate.clearValidators();
                }
                this.editSpecialLicenseForm.updateValueAndValidity();
            });
    }
    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeEditLicenseModal();
        this.editSpecialLicenseForm.reset();
        this.userSpecialLicenseId = undefined;
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

    private setupForm(): void {
        this.editSpecialLicenseForm.controls.noExpiryDate.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((noExpiryDate) => {
                if (noExpiryDate) {
                    this.editSpecialLicenseForm.controls.expiryDate.disable();
                    this.editSpecialLicenseForm.controls.expiryDate.setValidators(
                        [Validators.required]
                    );
                } else {
                    this.editSpecialLicenseForm.controls.expiryDate.enable();
                    this.editSpecialLicenseForm.controls.expiryDate.clearValidators();
                }
                this.editSpecialLicenseForm.updateValueAndValidity();
            });
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return combineLatest([
                        this.context$.pipe(
                            distinctUntilChanged((prev, curr) => {
                                return (
                                    JSON.stringify(prev) ===
                                    JSON.stringify(curr)
                                );
                            })
                        ),
                        this.licenseOptions$,
                    ]);
                })
            )
            .subscribe(([context, qualifications]) => {
                if (context && qualifications) {
                    this.userSpecialLicenseId =
                        context.userQualificationLicenseId;
                    this.editSpecialLicenseForm.patchValue({
                        licenseType: context.typeId,
                        fromDate: new Date(context.fromDate),
                        expiryDate: new Date(context.expireDate),
                        noExpiryDate: context.isNeverExpire,
                    });
                }
            });
    }

    save(): void {
        if (this.editSpecialLicenseForm.invalid || !this.userSpecialLicenseId) {
            Object.values(this.editSpecialLicenseForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.editSpecialLicenseForm.getRawValue();
        const formData = new FormData();
        if (this.fileToUpload) {
            formData.append(
                'DocumentFile',
                this.fileToUpload,
                this.fileToUpload.name
            );
            formData.append('DocumentPath', this.fileToUpload.name);
        }

        this.context$.pipe(take(1)).subscribe((data) => {
            formData.append(
                'UserQualificationLicenseId',
                this.userSpecialLicenseId
                    ? this.userSpecialLicenseId.toString()
                    : '0'
            );
            formData.append('displayName', data?.displayName ?? '');
            formData.append('TypeName', 'License');
            formData.append('TypeId', String(formValues.licenseType || 0));
            formData.append(
                'FromDate',
                formValues.fromDate?.toISOString() || ''
            );
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

            this.specialLicensesState
                .saveLicenses(formData)
                .then(() => {
                    this.status$.next('idle');
                    this.close();
                })
                .catch(() => {
                    this.status$.next('error');
                });
        });
    }
}
