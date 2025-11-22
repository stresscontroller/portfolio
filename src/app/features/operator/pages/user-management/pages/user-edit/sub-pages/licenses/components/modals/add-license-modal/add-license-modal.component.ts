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
    distinctUntilChanged,
    map,
    takeUntil,
    Subject,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import {
    FileSelectEvent,
    FileUpload,
    FileUploadModule,
} from 'primeng/fileupload';
import { UIStatus } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-add-license-modal',
    templateUrl: './add-license-modal.component.html',
    styleUrls: ['./add-license-modal.component.scss'],
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
export class AddLicenseModalComponent {
    uiState = inject(UIState);
    specialLicensesState = inject(SpecialLicensesState);

    @ViewChild('fileUploadComponent', { static: false })
    fileUploadComponent: FileUpload | undefined;

    addSpecialLicenseModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.addLicense),
        distinctUntilChanged()
    );

    isOpen$ = this.addSpecialLicenseModal$.pipe(map((modal) => modal.isOpen));

    licenseOptions$ = this.specialLicensesState.licenseOptions$;

    status$ = new BehaviorSubject<UIStatus>('idle');

    fileToUpload: File | undefined;

    addSpecialLicenseForm = new FormGroup({
        licenseType: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        fromDate: new FormControl<Date | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        expiryDate: new FormControl<Date | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        noExpiryDate: new FormControl(false),
    });
    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.addSpecialLicenseForm.controls.noExpiryDate.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((noExpiryDate) => {
                if (noExpiryDate) {
                    this.addSpecialLicenseForm.controls.expiryDate.disable();
                    this.addSpecialLicenseForm.controls.expiryDate.setValidators(
                        [Validators.required]
                    );
                } else {
                    this.addSpecialLicenseForm.controls.expiryDate.enable();
                    this.addSpecialLicenseForm.controls.expiryDate.clearValidators();
                }
                this.addSpecialLicenseForm.updateValueAndValidity();
            });
    }

    clear(): void {
        this.addSpecialLicenseForm.reset();
        this.status$.next('idle');
        if (this.fileUploadComponent) {
            this.fileUploadComponent.clear();
        }
    }

    close() {
        this.clear();
        this.uiState.closeAddLicenseModal();
    }

    onFileSelect(event: FileSelectEvent): void {
        const selectedFile = event.files[0];
        if (selectedFile) {
            this.fileToUpload = selectedFile;
        }
    }

    save(): void {
        if (this.addSpecialLicenseForm.invalid || !this.fileToUpload) {
            Object.values(this.addSpecialLicenseForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.addSpecialLicenseForm.getRawValue();
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
            this.fileToUpload.name || ''
            // formValues.licenseType?.specialLicense || ''
        );
        formData.append('TypeName', 'License');
        formData.append('TypeId', String(formValues.licenseType || 0));
        formData.append('FromDate', formValues.fromDate?.toISOString() || '');
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
    }
}
