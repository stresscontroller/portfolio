import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import {
    BehaviorSubject,
    Subject,
    catchError,
    combineLatest,
    distinctUntilChanged,
    filter,
    map,
    of,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';

import {
    UIStatus,
    EquipmentTypeFieldConfig,
    FleetManagementApiService,
} from '@app/core';

import { UIState, EquipmentTypeState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-edit-equipment-type-modal',
    templateUrl: './edit-equipment-type.component.html',
    styleUrls: ['./edit-equipment-type.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        RadioButtonModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
    ],
})
export class EditEquipmentTypeModalComponent {
    uiState = inject(UIState);
    equipmentTypeState = inject(EquipmentTypeState);
    fleetManagementApiService = inject(FleetManagementApiService);

    formBuilder = inject(FormBuilder);

    editEquipmentType$ = this.uiState.modals$.pipe(
        map((modals) => modals.editEquipmentType),
        distinctUntilChanged()
    );
    isOpen$ = this.editEquipmentType$.pipe(map((modal) => modal.isOpen));
    context$ = this.editEquipmentType$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    private destroyed$ = new Subject<void>();
    equipmentTypeFieldList$ = this.equipmentTypeState.equipmentTypeFieldList$;
    equipmentType$ = this.editEquipmentType$.pipe(map((data) => data.context));
    private equipmentTypeID: number = 0;
    equipmentTypeDetail$ = this.equipmentTypeState.equipmentTypeDetail$;

    editEquipmentTypeForm = new FormGroup({
        equipmentType: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        dailyMaxUsageLimit: new FormControl<number | null>(null),
        description: new FormControl<string | null>(null),
        engineOilChangeevery: new FormControl<number | null>(null),
        differentialOilChangeevery: new FormControl<number | null>(null),
        transmissionOilChangeevery: new FormControl<number | null>(null),
        hydraulicOilChangeevery: new FormControl<number | null>(null),
        batteryChangeCheckevery: new FormControl<number | null>(null),
        coolantFlushChangeevery: new FormControl<number | null>(null),
        usage: new FormControl<string | null>(null),
    });
    equipmentTypeFieldForm = new FormGroup({
        equipmentTypeFields: this.formBuilder.array<FormGroup>([]),
    });

    ngOnInit(): void {
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return combineLatest([
                        this.equipmentType$.pipe(
                            distinctUntilChanged((prev, curr) => {
                                return (
                                    JSON.stringify(prev) ===
                                    JSON.stringify(curr)
                                );
                            })
                        ),
                        this.equipmentType$,
                    ]);
                })
            )
            .subscribe(([equipmentTypeItem]) => {
                if (equipmentTypeItem) {
                    this.equipmentTypeID = equipmentTypeItem.equipmentTypeID;
                    this.setupForm();
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeEditEquipmentTypeModal();
    }

    createNewTypeField(defaults?: {
        equipmentTypeFieldId?: number;
        equipmentTypeFieldName?: string;
        isActive?: boolean;
    }): FormGroup {
        const newFormGroup = new FormGroup({
            equipmentTypeFieldId: new FormControl<number | null>(
                defaults?.equipmentTypeFieldId || null,
                {
                    validators: [Validators.required],
                    nonNullable: true,
                }
            ),
            equipmentTypeFieldName: new FormControl<string | null>(
                defaults?.equipmentTypeFieldName || null,
                {
                    validators: [Validators.required],
                    nonNullable: true,
                }
            ),
            isActive: new FormControl<boolean | null>(
                defaults?.isActive || null,
                {
                    validators: [Validators.required],
                    nonNullable: true,
                }
            ),
        });
        return newFormGroup;
    }

    private setupForm(): void {
        this.fleetManagementApiService
            .loadEquipmentTypeDetail(this.equipmentTypeID)
            .pipe(
                tap((res) => {
                    if (res.data) {
                        this.equipmentTypeFieldForm.controls.equipmentTypeFields.clear();
                        this.equipmentTypeFieldForm.controls.equipmentTypeFields =
                            this.formBuilder.array<FormGroup>([]);
                        res.data.equipmentTypeFieldList.forEach((list) => {
                            this.equipmentTypeFieldForm.controls.equipmentTypeFields.push(
                                this.createNewTypeField({
                                    equipmentTypeFieldId: Number(
                                        list.equipmentTypeFieldId
                                    ),
                                    equipmentTypeFieldName:
                                        list.equipmentTypeFieldName,
                                    isActive: list.isActive ?? false,
                                })
                            );
                        });
                        // Update the form values
                        this.editEquipmentTypeForm.patchValue({
                            equipmentType: res.data.equipmentName,
                            description: res.data.equipmentDescription,
                            engineOilChangeevery: res.data.engineOilChangeevery,
                            differentialOilChangeevery:
                                res.data.differentialOilChangeevery,
                            transmissionOilChangeevery:
                                res.data.transmissionOilChangeevery,
                            hydraulicOilChangeevery:
                                res.data.hydraulicOilChangeevery,
                            batteryChangeCheckevery:
                                res.data.batteryChangeCheckevery,
                            coolantFlushChangeevery:
                                res.data.coolantFlushChangeevery,
                            dailyMaxUsageLimit: res.data.dailyMaxUsageLimit,
                        });
                    }
                }),
                catchError((error) => {
                    return of(error);
                })
            )
            .subscribe();
    }

    save(): void {
        if (this.editEquipmentTypeForm.invalid) {
            Object.values(this.editEquipmentTypeForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }

        const typeFormValues = this.editEquipmentTypeForm.getRawValue();
        const fieldFormValues = this.equipmentTypeFieldForm.getRawValue();
        const fieldList: EquipmentTypeFieldConfig[] = [];
        fieldFormValues.equipmentTypeFields.forEach((list) => {
            fieldList.push({
                equipmentTypeFieldId: String(list['equipmentTypeFieldId']),
                isActive: list['isActive'] === true ? true : false,
            });
        });
        this.equipmentTypeState
            .saveEquipmentType({
                equipmentTypeID: this.equipmentTypeID,
                equipmentName: typeFormValues.equipmentType ?? '',
                equipmentDescription: typeFormValues.description ?? '',
                engineOilChangeevery: typeFormValues.engineOilChangeevery ?? 0,
                differentialOilChangeevery:
                    typeFormValues.differentialOilChangeevery ?? 0,
                transmissionOilChangeevery:
                    typeFormValues.transmissionOilChangeevery ?? 0,
                hydraulicOilChangeevery:
                    typeFormValues.hydraulicOilChangeevery ?? 0,
                batteryChangeCheckevery:
                    typeFormValues.batteryChangeCheckevery ?? 0,
                coolantFlushChangeevery:
                    typeFormValues.coolantFlushChangeevery ?? 0,
                dailyMaxUsageLimit: typeFormValues.dailyMaxUsageLimit ?? 0,
                companyId: '',
                equipmentTypeFieldList: fieldList,
            })
            .then(() => {
                this.close();
            });
    }
}
