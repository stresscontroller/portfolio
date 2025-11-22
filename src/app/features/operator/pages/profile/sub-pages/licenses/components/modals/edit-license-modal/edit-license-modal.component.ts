import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
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
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { UIStatus, UserQualificationListItem } from '@app/core';
import {
    FileSelectEvent,
    FileUpload,
    FileUploadModule,
} from 'primeng/fileupload';

interface IsActive {
    active: string;
    value: boolean;
}
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

    fileToUpload: File | undefined;
    licenseOptions$ = this.specialLicensesState.licenseOptions$;
    status$ = new BehaviorSubject<UIStatus>('idle');

    editSpecialLicenseForm = new FormGroup({
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

    savedLicenseInfo$ = this.editSpecialLicenseModal$.pipe(
        map((data) => data.context)
    );
    private savedLicenseInfo: UserQualificationListItem | undefined = undefined;
    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setupForm();
    }

    clear(): void {
        this.editSpecialLicenseForm.reset();
        this.savedLicenseInfo = undefined;
        this.status$.next('idle');
        if (this.fileUploadComponent) {
            this.fileUploadComponent.clear();
        }
    }

    close(): void {
        this.clear();
        this.uiState.closeEditLicenseModal();
    }

    onFileSelect(event: FileSelectEvent): void {
        const selectedFile = event.files[0];
        if (selectedFile) {
            this.fileToUpload = selectedFile;
        }
    }

    save(): void {
        if (this.editSpecialLicenseForm.invalid || !this.savedLicenseInfo) {
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
        this.specialLicensesState
            .saveLicenses({
                ...this.savedLicenseInfo,
                userQualificationLicenseId:
                    this.savedLicenseInfo.userQualificationLicenseId || 0,
                typeId: formValues.licenseTypeId || 0,
                fromDate: formValues.fromDate
                    ? formatDate(
                          new Date(formValues.fromDate),
                          'YYYY-MM-dd',
                          'en-US'
                      )
                    : '',
                expireDate: formValues.expireDate
                    ? formatDate(
                          new Date(formValues.expireDate),
                          'YYYY-MM-dd',
                          'en-US'
                      )
                    : '',
                isActive: formValues.isActive || false,
                documentFile: this.fileToUpload || null,
                documentPath: this.fileToUpload?.name || null,
            })
            .then(() => {
                this.specialLicensesState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    private setupForm(): void {
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return this.savedLicenseInfo$.pipe(
                        distinctUntilChanged((prev, curr) => {
                            return (
                                JSON.stringify(prev) === JSON.stringify(curr)
                            );
                        })
                    );
                })
            )
            .subscribe((licenseInfo) => {
                if (licenseInfo) {
                    this.savedLicenseInfo = licenseInfo;
                    this.editSpecialLicenseForm.patchValue({
                        licenseTypeId: licenseInfo.typeId,
                        fromDate: licenseInfo.fromDate
                            ? new Date(licenseInfo.fromDate)
                            : null,
                        expireDate: licenseInfo.expireDate
                            ? new Date(licenseInfo.expireDate)
                            : null,
                        isActive: licenseInfo.isActive || false,
                    });
                }
            });
    }
}
