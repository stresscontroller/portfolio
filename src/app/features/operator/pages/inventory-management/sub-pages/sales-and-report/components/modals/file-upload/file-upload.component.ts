import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SalesReportState, UIState } from '../../../state';
import {
    distinctUntilChanged,
    map,
    of,
    catchError,
    throwError,
    BehaviorSubject,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
    OperatorFiltersState,
    UserState,
    FilesMapApiService,
    ShipCompany,
    UIStatus,
} from '@app/core';
import {
    FileUploadModule,
    FileUpload,
    FileSelectEvent,
} from 'primeng/fileupload';

@Component({
    standalone: true,
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        DropdownModule,
        InputTextModule,
        FileUploadModule,
    ],
})
export class FileUploadComponent {
    @ViewChild('fileUploadComponent', { static: false })
    fileUploadComponent!: FileUpload;
    userState = inject(UserState);
    uiState = inject(UIState);
    operatorFiltersState = inject(OperatorFiltersState);
    salesReportState = inject(SalesReportState);
    filesMapApiService = inject(FilesMapApiService);
    fileUploadModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.uploadFile),
        distinctUntilChanged()
    );

    isOpen$ = this.fileUploadModal$.pipe(map((modal) => modal.isOpen));
    uploadFileForm = new FormGroup({
        cruiseLine: new FormControl<number | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        uploadFiles: new FormControl<FileList | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    cruiseLines$ = this.operatorFiltersState.cruiseLines$;
    reportFileStatus$ = this.salesReportState.reportFileStatus$;
    status$ = new BehaviorSubject<UIStatus>('idle');

    ngOnInit(): void {
        this.setupForm();
    }

    close(): void {
        this.uiState.closeUploadFileModal();
        this.salesReportState.resetFileUploadStatus();
        this.uploadFileForm.reset();
        this.fileUploadComponent.clear();
    }

    onFileSelect(event: FileSelectEvent) {
        const uploadedFiles: File[] = event.files;

        const filesList = new DataTransfer();
        for (let i = 0; i < uploadedFiles.length; i++) {
            filesList.items.add(uploadedFiles[i]);
        }

        this.uploadFileForm.patchValue({
            uploadFiles: filesList.files,
        });
    }

    private setupForm(): void {
        this.operatorFiltersState.getCruiseLines();
    }

    upload(): void {
        const formValues = this.uploadFileForm.getRawValue();
        if (this.uploadFileForm.invalid || formValues.cruiseLine === null) {
            Object.values(this.uploadFileForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        this.status$.next('loading');
        this.filesMapApiService
            .getShipCompanyFileHeaderTextMapsByShipCompanyId(
                formValues.cruiseLine
            )
            .pipe(
                map((res) => {
                    if (!res.success) {
                        return throwError(() => res.error);
                    }
                    return res.data;
                }),
                catchError((error) => {
                    this.status$.next('error');
                    return of(error);
                })
            )
            .subscribe((res) => {
                this.operatorFiltersState
                    .getCruiseLines()
                    .then((cruiseLines: ShipCompany[]) => {
                        const shipCompanyName = cruiseLines.find(
                            (cruiseLine) =>
                                cruiseLine.shipCompanyId ===
                                formValues.cruiseLine
                        )?.shipCompanyName;
                        if (res.length == 0) {
                            shipCompanyName + '-(Generic)';
                        }

                        const formData = new FormData();

                        // Append each file to formData
                        if (formValues.uploadFiles) {
                            for (
                                let i = 0;
                                i < formValues.uploadFiles.length;
                                i++
                            ) {
                                formData.append(
                                    'files',
                                    formValues.uploadFiles[i]
                                );
                            }
                        }
                        this.salesReportState
                            .validateAndUploadCruiseLinePreSalesData(
                                {
                                    shipCompanyId: formValues.cruiseLine || 0,
                                    shipCompanyName: shipCompanyName || '',
                                },
                                formData
                            )
                            .then(() => {
                                this.status$.next('idle');
                                this.salesReportState.refresh();
                                // this.close();
                            })
                            .catch(() => {
                                this.status$.next('error');
                            });
                    })
                    .catch(() => {
                        this.status$.next('error');
                    });
            });
    }
}
