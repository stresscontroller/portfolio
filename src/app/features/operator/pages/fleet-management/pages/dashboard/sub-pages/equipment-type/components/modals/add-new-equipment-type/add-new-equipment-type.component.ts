import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, Subject } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';

import { UIStatus, EquipmentTypeFieldConfig } from '@app/core';
import { UIState, EquipmentTypeState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-add-new-equipment-type-modal',
    templateUrl: './add-new-equipment-type.component.html',
    styleUrls: ['./add-new-equipment-type.component.scss'],
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
export class AddNewEquipmentTypeModalComponent {
    uiState = inject(UIState);
    quipmentTypeState = inject(EquipmentTypeState);
    formBuilder = inject(FormBuilder);

    addNewEquipmentType$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewEquipmentType),
        distinctUntilChanged()
    );
    isOpen$ = this.addNewEquipmentType$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    private destroyed$ = new Subject<void>();
    equipmentTypeFieldList$ = this.quipmentTypeState.equipmentTypeFieldList$;
    addEquipmentTypeForm = new FormGroup({
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
        this.equipmentTypeFieldList$.subscribe((data) => {
            data.forEach((list) => {
                this.equipmentTypeFieldForm.controls.equipmentTypeFields.push(
                    this.createNewTypeField({
                        equipmentTypeFieldId: list.equipmentTypeFieldId,
                        equipmentTypeFieldName: list.equipmentTypeFieldName,
                        isActive: false,
                    })
                );
            });
        });
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

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeAddNewEquipmentTypeModal();
    }

    save(): void {
        if (this.addEquipmentTypeForm.invalid) {
            Object.values(this.addEquipmentTypeForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }

        const typeFormValues = this.addEquipmentTypeForm.getRawValue();
        const fieldFormValues = this.equipmentTypeFieldForm.getRawValue();
        const fieldList: EquipmentTypeFieldConfig[] = [];
        fieldFormValues.equipmentTypeFields.forEach((list) => {
            fieldList.push({
                equipmentTypeFieldId: String(list['equipmentTypeFieldId']),
                isActive: list['isActive'] ? true : false,
            });
        });
        this.quipmentTypeState
            .saveEquipmentType({
                equipmentTypeID: 0,
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
