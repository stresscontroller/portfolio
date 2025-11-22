import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import {
    BehaviorSubject,
    Subject,
    combineLatest,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
} from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TabViewModule } from 'primeng/tabview';

import { CruiseLineConfig, UIStatus } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import {
    ToursServicesTableComponent,
    CruiseShipsTableComponent,
    ShipSchedulesTableComponent,
} from '../../tables';
import { UIState, CruiseLinesState } from '../../../state';
@Component({
    standalone: true,
    selector: 'app-edit-cruise-line-modal',
    templateUrl: './edit-cruise-line.component.html',
    styleUrls: ['./edit-cruise-line.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
        InputSwitchModule,
        TabViewModule,
        LoaderEmbedComponent,
        PermissionDirective,
        ToursServicesTableComponent,
        CruiseShipsTableComponent,
        ShipSchedulesTableComponent,
    ],
})
export class EditCruiseLineModalComponent {
    @ViewChild(ToursServicesTableComponent)
    tourServiceTable!: ToursServicesTableComponent;
    @ViewChild(CruiseShipsTableComponent)
    cruiseShipTable!: CruiseShipsTableComponent;
    @ViewChild(ShipSchedulesTableComponent)
    shipScheduleTable!: ShipSchedulesTableComponent;

    uiState = inject(UIState);
    cruiseLinesState = inject(CruiseLinesState);

    editCruiseLine$ = this.uiState.modals$.pipe(
        map((modals) => modals.editCruiseLine),
        distinctUntilChanged()
    );
    isOpen$ = this.editCruiseLine$.pipe(map((modal) => modal.isOpen));
    context$ = this.editCruiseLine$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    stateStatus$ = this.cruiseLinesState.status$;
    private destroyed$ = new Subject<void>();
    private shipCompanyId: number = 0;
    isLive: boolean = false;
    cruiseLineDetails$ = this.cruiseLinesState.cruiseLineDetails$;
    tourServiceList$ = this.cruiseLinesState.tourServiceList$;
    cruiseShipList$ = this.cruiseLinesState.cruiseShipList$;
    shipScheduleList$ = this.cruiseLinesState.shipScheduleList$;
    tourKeyword: string = '';
    shipKeyword: string = '';
    scheduleKeyword: string = '';

    editCruiseLineForm = new FormGroup({
        shipCompanyName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        dataSource: new FormControl<string | null>(null),
        isLive: new FormControl<boolean>(false),
        shipCompanyColor: new FormControl<string | null>(null),
        shipCompanyBackgroundColor: new FormControl<string | null>(null),
        invMgrFname: new FormControl<string | null>(null),
        invMgrLname: new FormControl<string | null>(null),
        invMgrEmail: new FormControl<string | null>(null),
        invMgrPhone: new FormControl<string | null>(null),
    });

    ngOnInit(): void {
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return combineLatest([
                        this.context$.pipe(
                            distinctUntilChanged((prev, curr) => {
                                return (
                                    JSON.stringify(prev) ===
                                    JSON.stringify(curr)
                                );
                            })
                        ),
                        this.context$,
                    ]);
                })
            )
            .subscribe(([context]) => {
                if (context) {
                    this.isLive = context.isLive;
                    this.shipCompanyId = context.shipCompanyId;
                    this.cruiseLinesState.loadCruiseLineDetails(
                        context.shipCompanyId
                    );
                    this.cruiseLinesState.loadTourServiceList(
                        context.shipCompanyId
                    );
                    this.cruiseLinesState.loadCruiseShipList(
                        false,
                        context.shipCompanyId
                    );
                    this.cruiseLinesState.loadShipScheduleList(
                        this.shipCompanyId
                    );
                }
            });
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.editCruiseLineForm.reset();
        this.uiState.closeEditCruiseLineModal();
    }

    private setupForm(): void {
        this.cruiseLineDetails$.subscribe((details) => {
            if (details) {
                if (details.dataSource === 'WIDGETY-API') {
                    this.editCruiseLineForm.get('shipCompanyName')?.disable();
                } else {
                    this.editCruiseLineForm.enable();
                }
                this.editCruiseLineForm.patchValue({
                    ...details,
                    invMgrEmail: details.invMgrEmail,
                });
            }
        });
    }

    save(): void {
        if (this.editCruiseLineForm.invalid) {
            Object.values(this.editCruiseLineForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.editCruiseLineForm.getRawValue();
        const config: CruiseLineConfig = {
            shipCompanyId: this.shipCompanyId,
            shipCompanyName: formValues.shipCompanyName ?? '',
            shipCompanyAddress: '',
            isLive: formValues.isLive ?? false,
            shipCompanyColor: formValues.shipCompanyColor ?? '',
            shipCompanyBackgroundColor:
                formValues.shipCompanyBackgroundColor ?? '',
            invMgrFname: formValues.invMgrFname ?? '',
            invMgrLname: formValues.invMgrLname ?? '',
            invMgrEmail: formValues.invMgrEmail ?? '',
            invMgrPhone: formValues.invMgrPhone ?? '',
        };
        this.cruiseLinesState
            .saveCruiseLine(config)
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    searchTour(): void {
        if (this.tourServiceTable) {
            this.tourServiceTable.search();
        }
    }

    searchShip(): void {
        if (this.cruiseShipTable) {
            this.cruiseShipTable.search();
        }
    }

    searchSchedule(): void {
        if (this.shipScheduleTable) {
            this.shipScheduleTable.search();
        }
    }
}
