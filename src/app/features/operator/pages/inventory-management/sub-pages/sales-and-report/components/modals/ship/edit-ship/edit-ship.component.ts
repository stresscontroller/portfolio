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
    selector: 'app-edit-ship',
    templateUrl: './edit-ship.component.html',
    styleUrls: ['./edit-ship.component.scss'],
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
export class EditShipComponent {
    userState = inject(UserState);
    uiState = inject(UIState);
    salesReportState = inject(SalesReportState);
    operatorFiltersState = inject(OperatorFiltersState);
    editShipModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editShip),
        distinctUntilChanged()
    );

    isOpen$ = this.editShipModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.editShipModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    editShipForm = new FormGroup({
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
        cruiseShip: new FormControl<string | null>(
            {
                value: null,
                disabled: true,
            },
            {
                validators: [Validators.required],
                nonNullable: true,
            }
        ),
        cruiseLineShipName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        shipCompanyShipMapsId: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
    });
    status$ = new BehaviorSubject<UIStatus>('idle');
    cruiseLines$ = this.operatorFiltersState.cruiseLines$;
    cruiseShips$ = this.editShipForm.controls.cruiseLine.valueChanges.pipe(
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

    appliedFilters$ = this.editShipModal$.pipe(map((data) => data.context));
    selectedInventoriesToRelease: string[] = [];

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close() {
        this.uiState.closeEditShipModal();
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
                    this.editShipForm.patchValue({
                        cruiseLine: appliedFilters.shipCompanyId || null,
                        cruiseLineShipName:
                            appliedFilters.cruiseLineShipName || '',
                        cruiseShip: appliedFilters.shipName || '',
                        shipCompanyShipMapsId:
                            appliedFilters.shipCompanyShipMapsId,
                    });
                }
            });

        this.editShipForm.controls.cruiseLine.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                this.editShipForm.controls.cruiseShip.updateValueAndValidity();
            });
    }

    save(): void {
        if (this.editShipForm.invalid) {
            Object.values(this.editShipForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.editShipForm.getRawValue();
        this.status$.next('loading');
        this.salesReportState
            .updateInsertShipCompanyShipMap({
                shipCompanyShipMapsId: formValues.shipCompanyShipMapsId || 0,
                cruiseLineShipName: formValues.cruiseLineShipName || '',
                shipName: formValues.cruiseShip || '',
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
