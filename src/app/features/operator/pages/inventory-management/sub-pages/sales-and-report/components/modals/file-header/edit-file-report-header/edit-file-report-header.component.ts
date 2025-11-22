import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SalesReportState, UIState } from '../../../../state';
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
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { OperatorFiltersState } from '@app/core';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    standalone: true,
    selector: 'app-edit-file-report-header',
    templateUrl: './edit-file-report-header.component.html',
    styleUrls: ['./edit-file-report-header.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        DropdownModule,
        InputTextModule,
        InputNumberModule,
    ],
})
export class EditFileReportHeaderComponent {
    salesReportState = inject(SalesReportState);
    uiState = inject(UIState);
    operatorFiltersState = inject(OperatorFiltersState);
    editReportModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editReport),
        distinctUntilChanged()
    );

    isOpen$ = this.editReportModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.editReportModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    editReportForm = new FormGroup({
        cruiseLine: new FormControl<number | null>(
            {
                value: null,
                disabled: true,
            },
            {
                validators: [Validators.required],
                nonNullable: true,
            }
        ),
        cruiseShip: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        tour: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        port: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        fromDate: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        fromTime: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        amountSold: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        headerColumnCount: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        cruiseLineTourFileId: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        headerRow: new FormControl<number | null>(null),
    });
    status$ = new BehaviorSubject<'idle' | 'loading' | 'success' | 'error'>(
        'idle'
    );
    cruiseLines$ = this.operatorFiltersState.cruiseLines$;
    inventoryManagementInventoryType$ =
        this.operatorFiltersState.inventoryManagementInventoryType$;

    appliedFilters$ = this.editReportModal$.pipe(map((data) => data.context));

    selectedInventoriesToRelease: string[] = [];

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setupForm();
    }

    close() {
        this.uiState.closeEditReportModal();
    }

    private async setupForm() {
        await this.operatorFiltersState.getCruiseLines();
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return this.appliedFilters$.pipe(
                        distinctUntilChanged((prev, curr) => {
                            return (
                                JSON.stringify(prev) === JSON.stringify(curr)
                            );
                        }),
                        takeUntil(this.destroyed$)
                    );
                })
            )
            .subscribe(async (appliedFilters) => {
                if (appliedFilters) {
                    // all shipCompanyIds for cruises are greater than 0
                    if (appliedFilters.shipCompanyId != null) {
                        await this.operatorFiltersState.getShipList(
                            appliedFilters.shipCompanyId
                        );
                    }
                    this.editReportForm.patchValue({
                        cruiseLine: appliedFilters.shipCompanyId || null,
                        cruiseShip: appliedFilters.shipName || null,
                        tour: appliedFilters.cruiseLineTourName || null,
                        port: appliedFilters.portName || null,
                        fromDate: appliedFilters.startDateText || null,
                        fromTime: appliedFilters.startTimeText || null,
                        amountSold: appliedFilters.amountSoldText || null,
                        headerRow: appliedFilters.headerRow || null,
                        headerColumnCount:
                            appliedFilters.headerColumnCount || null,
                        cruiseLineTourFileId:
                            appliedFilters.cruiseLineTourFileId || null,
                    });
                }
            });

        this.editReportForm.controls.cruiseLine.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((cruiseLine) => {
                if (cruiseLine === null || cruiseLine === 0) {
                    this.editReportForm.controls.cruiseShip.disable();
                } else {
                    this.editReportForm.controls.cruiseShip.enable();
                }
                this.editReportForm.controls.cruiseShip.updateValueAndValidity();
            });
    }

    save() {
        if (this.editReportForm.invalid) {
            Object.values(this.editReportForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.editReportForm.getRawValue();
        this.status$.next('loading');
        this.salesReportState
            .updateInsertShipCompanyFileHeaderTextMap({
                shipCompanyId: formValues.cruiseLine || 0,
                cruiseLineTourFileId: formValues.cruiseLineTourFileId || 0,
                portName: formValues.port || '',
                shipName: formValues.cruiseShip || '',
                cruiseLineTourName: formValues.tour || '',
                startDateText: formValues.fromDate || '',
                startTimeText: formValues.fromTime || '',
                amountSoldText: formValues.amountSold || '',
                headerRow: formValues.headerRow ? +formValues.headerRow : 0,
                headerColumnCount: formValues.headerColumnCount || 0,
            })
            .then(() => {
                this.status$.next('idle');
                this.salesReportState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
