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
import { OperatorFiltersState, UIStatus, UserState } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-add-new-ship',
    templateUrl: './add-new-ship.component.html',
    styleUrls: ['./add-new-ship.component.scss'],
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
export class AddNewShipComponent {
    userState = inject(UserState);
    uiState = inject(UIState);
    operatorFiltersState = inject(OperatorFiltersState);
    salesReportState = inject(SalesReportState);
    addNewShipModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewShip),
        distinctUntilChanged()
    );

    isOpen$ = this.addNewShipModal$.pipe(map((modal) => modal.isOpen));

    addNewShipForm = new FormGroup({
        cruiseLine: new FormControl<number | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        cruiseShip: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        cruiseLineShipName: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    cruiseLines$ = this.operatorFiltersState.cruiseLines$;
    cruiseShips$ = this.addNewShipForm.controls.cruiseLine.valueChanges.pipe(
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

    status$ = new BehaviorSubject<UIStatus>('idle');
    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.uiState.closeAddNewShipModal();
    }

    private async setupForm() {
        await this.operatorFiltersState.getCruiseLines();

        this.addNewShipForm.controls.cruiseLine.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((cruiseLine) => {
                if (cruiseLine === null || cruiseLine === 0) {
                    this.addNewShipForm.controls.cruiseShip.disable();
                } else {
                    this.addNewShipForm.controls.cruiseShip.enable();
                }
                this.addNewShipForm.controls.cruiseShip.updateValueAndValidity();
            });
    }

    save(): void {
        if (this.addNewShipForm.invalid) {
            Object.values(this.addNewShipForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.addNewShipForm.getRawValue();
        this.status$.next('loading');
        this.salesReportState
            .updateInsertShipCompanyShipMap({
                shipCompanyShipMapsId: 0,
                shipName: formValues.cruiseShip || '',
                cruiseLineShipName: formValues.cruiseLineShipName || '',
                companyUniqueID:
                    this.userState.aspNetUser$.getValue()?.companyUniqueID ||
                    '',
                shipCompanyId: formValues.cruiseLine || 0,
            })
            .then(() => {
                this.status$.next('idle');
                this.close();
                this.salesReportState.refresh();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
