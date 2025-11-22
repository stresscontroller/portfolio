import { CommonModule, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import { adjustDate } from '@app/core';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';

import { Subject, filter, take, takeUntil } from 'rxjs';

import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { EquipmentInfoState } from './equipment-info.state';

interface Status {
    isOperable: string;
    value: boolean;
}

@Component({
    standalone: true,
    selector: 'app-equipment-info',
    templateUrl: './equipment-info.component.html',
    styleUrls: ['./equipment-info.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DropdownModule,
        InputTextModule,
        CalendarModule,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
    providers: [EquipmentInfoState],
})
export class EquipmentInfoComponent {
    equipmentInfoState = inject(EquipmentInfoState);
    equipmentInfoForm = new FormGroup({
        equipmentTypeID: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        licensePlate: new FormControl<string | null>(null),
        equipmentNumber: new FormControl<string | null>(null),
        serialNo: new FormControl<string | null>(null),
        equipmentDescription: new FormControl<string | null>(null),
        vinNo: new FormControl<string | null>(null),
        make: new FormControl<string | null>(null),
        isOperable: new FormControl<boolean | null>(null),
        model: new FormControl<string | null>(null),
        locationId: new FormControl<number | null>(null),
        lastDateOfOperation: new FormControl<string | null>(null),
        maxCapacity: new FormControl<number | null>(null),
        isAvailable: new FormControl<boolean | null>(null),
        odometerMileageHours: new FormControl<number | null>(null),
        year: new FormControl<number | null>(null),

        engineOilInterval: new FormControl<string | null>(null),
        engineOilChange: new FormControl<Date | null>(null),
        differentialGearoil: new FormControl<number | null>(null),
        differentialGearOilChange: new FormControl<Date | null>(null),
        transmissionOilInterval: new FormControl<string | null>(null),
        transmissionOilChange: new FormControl<Date | null>(null),
        batteryChangeInterval: new FormControl<number | null>(null),
        batteryChange: new FormControl<Date | null>(null),
        hydraulicOilInterval: new FormControl<number | null>(null),
        hydraulicOilChange: new FormControl<Date | null>(null),
        coolantFlushChangeInterval: new FormControl<number | null>(null),
        coolantFlushChange: new FormControl<Date | null>(null),
    });
    private isDestroyed$ = new Subject<void>();

    status$ = this.equipmentInfoState.status$;
    equipmentDetail$ = this.equipmentInfoState.equipmentDetail$;
    equipmentTypeList$ = this.equipmentInfoState.equipmentTypeList$;
    locations$ = this.equipmentInfoState.locations$;
    statusOption: Status[] = [
        { isOperable: 'Operable', value: true },
        {
            isOperable: 'Not Operable',
            value: false,
        },
    ];
    private equipmentId: number | undefined = undefined;
    nextEngineOilChangeAt: number | undefined = undefined;
    differentialGearOilChangeAt: number | undefined = undefined;
    transmissionOilChangeAt: number | undefined = undefined;
    hydraulicOilChangeAt: number | undefined = undefined;

    ngOnInit(): void {
        this.equipmentInfoState.init();
        this.setupForm();
    }

    private async setupForm() {
        this.equipmentDetail$
            .pipe(
                filter((res) => !!res),
                take(1),
                takeUntil(this.isDestroyed$)
            )
            .subscribe((res) => {
                if (res) {
                    this.equipmentId = res.equipmentID;
                    this.nextEngineOilChangeAt = res.nextEngineOilChangeAt;
                    this.differentialGearOilChangeAt =
                        res.differentialGearOilChangeAt;
                    this.transmissionOilChangeAt = res.transmissionOilChangeAt;
                    this.hydraulicOilChangeAt = res.hydraulicOilChangeAt;
                    this.equipmentInfoForm.patchValue({
                        ...res,
                        engineOilChange: res.engineOilChange
                            ? adjustDate(new Date(res.engineOilChange))
                            : new Date(),
                        differentialGearOilChange: res.differentialGearOilChange
                            ? adjustDate(
                                  new Date(res.differentialGearOilChange)
                              )
                            : new Date(),
                        transmissionOilChange: res.transmissionOilChange
                            ? adjustDate(new Date(res.transmissionOilChange))
                            : new Date(),
                        batteryChange: res.batteryChange
                            ? adjustDate(new Date(res.batteryChange))
                            : new Date(),
                        hydraulicOilChange: res.hydraulicOilChange
                            ? adjustDate(new Date(res.hydraulicOilChange))
                            : new Date(),
                        coolantFlushChange: res.coolantFlushChange
                            ? adjustDate(new Date(res.coolantFlushChange))
                            : new Date(),
                    });
                }
            });
    }

    saveEquipmentInfo(): void {
        const formValues = this.equipmentInfoForm.value;
        this.equipmentInfoState
            .saveEquipment({
                equipmentID: this.equipmentId ?? 0,
                equipmentTypeID: formValues.equipmentTypeID ?? 0,
                equipmentNumber: formValues.equipmentNumber ?? '',
                equipmentDescription: formValues.equipmentDescription ?? '',
                make: formValues.make ?? '',
                isOperable: formValues.isOperable ?? false,
                model: formValues.model ?? '',
                year: formValues.year ?? 0,
                lastDateOfOperation: formValues.lastDateOfOperation
                    ? formatDate(
                          new Date(formValues.lastDateOfOperation),
                          'YYYY-MM-dd',
                          'en-US'
                      )
                    : '',
                locationId: formValues.locationId ?? 0,
                maxCapacity: formValues.maxCapacity ?? 0,
                isAvailable: formValues.isAvailable ?? true,
                odometerMileageHours: formValues.odometerMileageHours ?? 0,
                companyId: '',

                viNno: formValues.vinNo ?? '',
                licensePlate: formValues.licensePlate ?? '',
                serialNo: formValues.serialNo ?? '',
                differentialGearOil: formValues.differentialGearoil ?? 0,
                hydraulicOilInterval: formValues.hydraulicOilInterval ?? 0,
                batteryChange: formatDate(new Date(), 'YYYY-MM-dd', 'en-US'),
                engineOilInterval: formValues.engineOilInterval ?? '',
                transmissionOilInterval:
                    formValues.transmissionOilInterval ?? '',
                batteryChangeInterval: formValues.batteryChangeInterval ?? 0,
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
                nextEngineOilChangeAt: this.nextEngineOilChangeAt ?? 0,
                differentialGearOilChangeAt:
                    this.differentialGearOilChangeAt ?? 0,
                transmissionOilChangeAt: this.transmissionOilChangeAt ?? 0,
                hydraulicOilChangeAt: this.hydraulicOilChangeAt ?? 0,
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
                coolantFlushChangeInterval:
                    formValues.coolantFlushChangeInterval ?? 0,
            })
            .then(() => {
                this.refresh();
            });
    }

    refresh(): void {}

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }
}
