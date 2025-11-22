import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { SalesReportState, UIState } from '../../../../state';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { OperatorFiltersState, UIStatus, UserState } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-add-new-port',
    templateUrl: './add-new-port.component.html',
    styleUrls: ['./add-new-port.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        DropdownModule,
        InputTextModule,
    ],
})
export class AddNewPortComponent {
    userState = inject(UserState);
    uiState = inject(UIState);
    operatorFiltersState = inject(OperatorFiltersState);
    salesReportState = inject(SalesReportState);
    addNewPortModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewPort),
        distinctUntilChanged()
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    isOpen$ = this.addNewPortModal$.pipe(map((modal) => modal.isOpen));

    addNewPortForm = new FormGroup({
        cruiseLine: new FormControl<number | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        port: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        cruiseLinePortName: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    cruiseLines$ = this.operatorFiltersState.cruiseLines$;
    ports$ = this.operatorFiltersState.ports$;

    close(): void {
        this.uiState.closeAddNewPortModal();
    }

    save(): void {
        if (this.addNewPortForm.invalid) {
            Object.values(this.addNewPortForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.addNewPortForm.getRawValue();
        this.status$.next('loading');
        this.salesReportState
            .updateInsertShipCompanyPortMap({
                shipCompanyPortMapsId: 0,
                portName: formValues.port || '',
                cruiseLinePortName: formValues.cruiseLinePortName || '',
                companyUniqueID:
                    this.userState.aspNetUser$.getValue()?.companyUniqueID ||
                    '',
                shipCompanyId: formValues.cruiseLine || 0,
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
