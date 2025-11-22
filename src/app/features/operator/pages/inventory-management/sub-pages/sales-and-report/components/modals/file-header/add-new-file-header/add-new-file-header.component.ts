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
    from,
    map,
    of,
    switchMap,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { OperatorFiltersState, UIStatus } from '@app/core';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    standalone: true,
    selector: 'app-add-new-file-header',
    templateUrl: './add-new-file-header.component.html',
    styleUrls: ['./add-new-file-header.component.scss'],
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
export class AddNewFileHeaderComponent {
    uiState = inject(UIState);
    operatorFiltersState = inject(OperatorFiltersState);
    salesReportState = inject(SalesReportState);
    addNewReportModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewReport),
        distinctUntilChanged()
    );

    isOpen$ = this.addNewReportModal$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    addNewReportForm = new FormGroup({
        cruiseLine: new FormControl<number | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        cruiseShip: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        tour: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        port: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        startDate: new FormControl<string | null>(null, {
            validators: [Validators.required],
        }),
        startTime: new FormControl<string | null>(null, {
            validators: [Validators.required],
        }),
        amountSold: new FormControl<string | null>(null, {
            validators: [Validators.required],
        }),
        headerRow: new FormControl<number | null>(null, {
            validators: [Validators.required],
        }),
    });

    cruiseLines$ = this.operatorFiltersState.cruiseLines$;
    cruiseShips$ = this.addNewReportForm.controls.cruiseLine.valueChanges.pipe(
        switchMap((cruiseLine) => {
            if (cruiseLine == null) {
                return of([]);
            }
            const cruiseShips =
                this.operatorFiltersState.cruiseShips$.getValue();
            if (cruiseShips?.[cruiseLine]) {
                return of(cruiseShips[cruiseLine]);
            } else {
                return from(this.operatorFiltersState.getShipList(cruiseLine));
            }
        })
    );
    tours$ = this.operatorFiltersState.tours$;
    ports$ = this.operatorFiltersState.ports$;

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.uiState.closeAddNewReportModal();
    }

    private async setupForm() {
        await this.operatorFiltersState.getCruiseLines();
        await this.operatorFiltersState.getPorts();
        await this.operatorFiltersState.getTours();

        this.addNewReportForm.controls.cruiseLine.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((cruiseLine) => {
                if (cruiseLine === null || cruiseLine === 0) {
                    this.addNewReportForm.controls.cruiseShip.disable();
                } else {
                    this.addNewReportForm.controls.cruiseShip.enable();
                }
                this.addNewReportForm.controls.cruiseShip.updateValueAndValidity();
            });
    }

    save(): void {
        if (this.addNewReportForm.invalid) {
            Object.values(this.addNewReportForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.addNewReportForm.getRawValue();
        this.status$.next('loading');
        this.salesReportState
            .updateInsertShipCompanyFileHeaderTextMap({
                shipCompanyId: formValues.cruiseLine || 0,
                cruiseLineTourFileId: 0,
                portName: formValues.port || '',
                shipName: formValues.cruiseShip || '',
                cruiseLineTourName: formValues.tour || '',
                startDateText: formValues.startDate || '',
                startTimeText: formValues.startTime || '',
                amountSoldText: formValues.amountSold || '',
                headerRow: formValues.headerRow ? +formValues.headerRow : 0,
                headerColumnCount: 0,
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
