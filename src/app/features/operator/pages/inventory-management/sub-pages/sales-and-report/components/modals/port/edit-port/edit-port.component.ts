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
    selector: 'app-edit-port',
    templateUrl: './edit-port.component.html',
    styleUrls: ['./edit-port.component.scss'],
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
export class EditPortComponent {
    userState = inject(UserState);
    uiState = inject(UIState);
    salesReportState = inject(SalesReportState);
    operatorFiltersState = inject(OperatorFiltersState);
    editPortModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editPort),
        distinctUntilChanged()
    );

    isOpen$ = this.editPortModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.editPortModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    editPortForm = new FormGroup({
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
        port: new FormControl<string | null>(
            {
                value: null,
                disabled: true,
            },
            {
                validators: [Validators.required],
                nonNullable: true,
            }
        ),
        cruiseLinePortName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        shipCompanyPortMapsId: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
    });
    status$ = new BehaviorSubject<UIStatus>('idle');
    ports$ = this.operatorFiltersState.ports$;
    cruiseLines$ = this.operatorFiltersState.cruiseLines$;
    cruiseShips$ = this.editPortForm.controls.cruiseLine.valueChanges.pipe(
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

    appliedFilters$ = this.editPortModal$.pipe(map((data) => data.context));

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setupForm();
    }

    close(): void {
        this.uiState.closeEditPortModal();
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

                    this.editPortForm.patchValue({
                        cruiseLine: appliedFilters.shipCompanyId || null,
                        cruiseLinePortName:
                            appliedFilters.cruiseLinePortName || '',
                        port: appliedFilters.portName || '',
                        shipCompanyPortMapsId:
                            appliedFilters.shipCompanyPortMapsId,
                    });
                }
            });
    }

    save(): void {
        if (this.editPortForm.invalid) {
            Object.values(this.editPortForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.editPortForm.getRawValue();
        this.status$.next('loading');
        this.salesReportState
            .updateInsertShipCompanyPortMap({
                shipCompanyPortMapsId: formValues.shipCompanyPortMapsId || 0,
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
