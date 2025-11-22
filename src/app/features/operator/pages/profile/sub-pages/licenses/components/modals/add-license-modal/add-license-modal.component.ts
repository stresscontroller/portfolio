import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';

import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SpecialLicensesState, UIState } from '../../../state';
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
import { UIStatus } from '@app/core';

interface IsActive {
    active: string;
    value: boolean;
}

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
        licenseTypeId: new FormControl<number | null>(null, [
            Validators.required,
        ]),
        isActive: new FormControl<boolean | null>(null, [Validators.required]),
        fromDate: new FormControl<Date | null>(null, [Validators.required]),
        expireDate: new FormControl<Date | null>(null, [Validators.required]),
    });

    isActiveOptions: IsActive[] = [
        { active: 'True', value: true },
        { active: 'False', value: false },
    ];

    clear(): void {
        this.addSpecialLicenseForm.reset();
        this.status$.next('idle');
        if (this.fileUploadComponent) {
            this.fileUploadComponent.clear();
        }
    }

    close(): void {
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
        this.specialLicensesState
            .saveLicenses({
                userQualificationLicenseId: 0,
                typeName: 'License',
                typeId: formValues.licenseTypeId || 0,
                displayName: this.fileToUpload.name || '',
                fromDate: formValues.fromDate
                    ? formatDate(formValues.fromDate, 'YYYY-MM-dd', 'en-US')
                    : '',
                expireDate: formValues.expireDate
                    ? formatDate(formValues.expireDate, 'YYYY-MM-dd', 'en-US')
                    : '',
                isNeverExpire: false,
                isActive: formValues.isActive || false,
                documentPath: this.fileToUpload.name,
                userid: '',
                companyUniqueId: '',
                documentFile: this.fileToUpload,
            })
            .then(() => {
                this.specialLicensesState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
