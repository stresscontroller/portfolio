import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, Subject } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';

import { UIStatus } from '@app/core';
import { UIState, EquipmentsState } from '../../../state';

interface Status {
    isOperable: string;
    value: boolean;
}

@Component({
    standalone: true,
    selector: 'app-add-new-equipment-modal',
    templateUrl: './add-new-equipment.component.html',
    styleUrls: ['./add-new-equipment.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        InputTextModule,
    ],
})
export class AddNewEquipmentModalComponent {
    uiState = inject(UIState);
    equipmentsState = inject(EquipmentsState);

    addNewEquipment$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewEquipment),
        distinctUntilChanged()
    );
    isOpen$ = this.addNewEquipment$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    private destroyed$ = new Subject<void>();
    equipmentTypeList$ = this.equipmentsState.equipmentTypeList$;
    statusOption: Status[] = [
        { isOperable: 'Operable', value: true },
        {
            isOperable: 'Not Operable',
            value: false,
        },
    ];
    locations$ = this.equipmentsState.locations$;

    addEquipmentForm = new FormGroup({
        equipmentType: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        equipmentID: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        description: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        make: new FormControl<string | null>(null),
        model: new FormControl<string | null>(null),
        year: new FormControl<number | null>(null),
        maxCapacity: new FormControl<number | null>(null),
        odometerHours: new FormControl<number | null>(null),
        status: new FormControl<boolean | null>(null),
        locationDeployed: new FormControl<number | null>(null),
        lastDate: new FormControl<Date | null>(null),
        isAvailable: new FormControl(false),
    });

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeAddNewEquipmentModal();
    }

    add(): void {
        const formValues = this.addEquipmentForm.value;
        this.equipmentsState
            .saveEquipment({
                equipmentID: 0,
                equipmentTypeID: formValues.equipmentType ?? 0,
                equipmentNumber: formValues.equipmentID ?? '',
                equipmentDescription: formValues.description ?? '',
                make: formValues.make ?? '',
                isOperable: formValues.status ?? false,
                model: formValues.model ?? '',
                year: formValues.year ?? 0,
                lastDateOfOperation: formValues.lastDate
                    ? formatDate(
                          new Date(formValues.lastDate),
                          'YYYY-MM-dd',
                          'en-US'
                      )
                    : '',
                locationId: formValues.locationDeployed ?? 0,
                maxCapacity: formValues.maxCapacity ?? 0,
                isAvailable: formValues.isAvailable ?? true,
                odometerMileageHours: formValues.odometerHours ?? 0,
                companyId: '',

                viNno: '',
                licensePlate: '',
                serialNo: '',
                differentialGearOil: 0,
                hydraulicOilInterval: 0,
                batteryChange: formatDate(new Date(), 'YYYY-MM-dd', 'en-US'),
                engineOilInterval: '',
                transmissionOilInterval: '',
                batteryChangeInterval: 0,
                engineOilChange: formatDate(new Date(), 'YYYY-MM-dd', 'en-US'),
                hydraulicOilChange: formatDate(
                    new Date(),
                    'YYYY-MM-dd',
                    'en-US'
                ),
                transmissionOilChange: formatDate(
                    new Date(),
                    'YYYY-MM-dd',
                    'en-US'
                ),
                differentialGearOilChange: formatDate(
                    new Date(),
                    'YYYY-MM-dd',
                    'en-US'
                ),
                nextEngineOilChangeAt: 0,
                differentialGearOilChangeAt: 0,
                transmissionOilChangeAt: 0,
                hydraulicOilChangeAt: 0,
                batteryChangeAt: formatDate(new Date(), 'YYYY-MM-dd', 'en-US'),
                coolantFlushChangeAt: formatDate(
                    new Date(),
                    'YYYY-MM-dd',
                    'en-US'
                ),
                coolantFlushChange: formatDate(
                    new Date(),
                    'YYYY-MM-dd',
                    'en-US'
                ),
                coolantFlushChangeInterval: 0,
            })
            .then(() => {
                this.close();
            });
    }
}
