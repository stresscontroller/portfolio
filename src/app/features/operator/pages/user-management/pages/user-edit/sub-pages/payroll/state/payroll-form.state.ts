import { Injectable, inject } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { PayrollState } from './payroll.state';
import { adjustDate, dateRangeValidator } from '@app/core';

@Injectable()
export class PayrollFormState {
    payrollState = inject(PayrollState);
    formBuilder = inject(FormBuilder);

    payrollForm = new FormGroup(
        {
            companyEmail: new FormControl<string>('', {
                nonNullable: true,
                validators: [Validators.email],
            }),
            employeeFirstDay: new FormControl<Date | null>(null, {
                nonNullable: true,
                validators: [Validators.required],
            }),
            employeeLastDay: new FormControl<Date | null>(null, {
                nonNullable: true,
            }),
            locationId: new FormControl<number | null>(null, {
                validators: [Validators.required],
                nonNullable: true,
            }),
            startDate: new FormControl<Date | null>(null, {
                validators: [Validators.required],
                nonNullable: true,
            }),
            arrivalDate: new FormControl<Date | null>(null, {
                nonNullable: true,
            }),
            isEligibleForRehire: new FormControl<boolean>(false),
            isHired: new FormControl<boolean>(false),
        },
        {
            validators: dateRangeValidator(
                'employeeFirstDay',
                'employeeLastDay'
            ),
        }
    );

    positionForm = new FormGroup({
        positions: this.formBuilder.array<FormGroup>([]),
    });

    addNewPosition(): void {
        this.positionForm.controls.positions.push(this.createNewPosition());
    }

    removePosition(index: number): void {
        this.positionForm.controls.positions.removeAt(index);
    }

    createNewPosition(defaults?: {
        departmentId?: number;
        positionId?: number;
        payRate?: number;
    }): FormGroup {
        const positionFormGroup = new FormGroup({
            departmentId: new FormControl<number | null>(
                defaults?.departmentId || null,
                {
                    validators: [Validators.required],
                    nonNullable: true,
                }
            ),
            positionId: new FormControl<number | null>(
                defaults?.positionId || null,
                {
                    validators: [Validators.required],
                    nonNullable: true,
                }
            ),
            payRate: new FormControl<number | null>(defaults?.payRate || null, {
                validators: [Validators.required],
                nonNullable: true,
            }),
        });
        positionFormGroup.controls.departmentId.valueChanges.subscribe(
            (departmentId) => {
                if (departmentId) {
                    this.payrollState.loadPositions(departmentId);
                }
                positionFormGroup.controls.positionId.reset();
            }
        );
        positionFormGroup.controls.positionId.valueChanges.subscribe(
            (positionId) => {
                if (positionId && !positionFormGroup.controls.payRate.value) {
                    this.payrollState
                        .loadPayRateAmount(positionId)
                        .then((payRate) => {
                            positionFormGroup.patchValue(
                                {
                                    payRate,
                                },
                                {
                                    emitEvent: false,
                                }
                            );
                        });
                }
                positionFormGroup.controls.payRate.reset();
            }
        );
        return positionFormGroup;
    }

    initPayrollForm(): void {
        this.payrollState.payrollDetails$.subscribe((payrollDetails) => {
            this.payrollForm.reset();
            this.positionForm.controls.positions.clear();
            if (payrollDetails) {
                this.payrollForm.patchValue(
                    {
                        companyEmail: payrollDetails.companyEmail || '',
                        employeeFirstDay: payrollDetails.employeeFirstDay
                            ? adjustDate(
                                  new Date(payrollDetails.employeeFirstDay)
                              )
                            : null,
                        employeeLastDay: payrollDetails.employeeLastDay
                            ? adjustDate(
                                  new Date(payrollDetails.employeeLastDay)
                              )
                            : null,
                        locationId: payrollDetails.locationId,
                        startDate: payrollDetails.startDate
                            ? adjustDate(new Date(payrollDetails.startDate))
                            : null,
                        arrivalDate: payrollDetails.arrivalDate
                            ? adjustDate(new Date(payrollDetails.arrivalDate))
                            : null,
                        isHired: payrollDetails.isHired || false,
                        isEligibleForRehire:
                            payrollDetails.isEligibleForRehire || false,
                    },
                    { emitEvent: false }
                );

                if (payrollDetails.payRatesList) {
                    payrollDetails.payRatesList.forEach((position) => {
                        this.positionForm.controls.positions.push(
                            this.createNewPosition({
                                departmentId:
                                    position.departmentId || undefined,
                                positionId: position.positionId || undefined,
                                payRate: position.payRate || undefined,
                            })
                        );
                        if (position.departmentId) {
                            this.payrollState.loadPositions(
                                position.departmentId
                            );
                        }
                    });
                }
            }
        });
    }

    save(): void {
        if (this.payrollForm.invalid || this.positionForm.invalid) {
            Object.values(this.payrollForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            Object.values(this.positionForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            if (this.payrollForm.errors?.['dateRange']) {
                const employeeFirstDayControl =
                    this.payrollForm.get('employeeFirstDay');
                const employeeLastDayControl =
                    this.payrollForm.get('employeeLastDay');

                if (employeeFirstDayControl && employeeLastDayControl) {
                    employeeFirstDayControl.markAsDirty();
                    employeeFirstDayControl.markAsTouched();
                    employeeLastDayControl.markAsDirty();
                    employeeLastDayControl.markAsTouched();
                }
            }
            return;
        }

        const payrollFormValues = this.payrollForm.value;
        const positionFormValues = this.positionForm.value;
        const savedPayrollDetails =
            this.payrollState.payrollDetails$.getValue();
        this.payrollState.saveUserPayroll({
            userId: '',
            companyId: '',
            userPayRollId: savedPayrollDetails?.userPayRollId || 0,

            // form values
            locationId: payrollFormValues.locationId || 0,
            isEligibleForRehire: payrollFormValues.isEligibleForRehire || false,
            isHired: payrollFormValues.isHired || false,
            payRatesList:
                positionFormValues.positions?.map((position) => ({
                    ...position,
                })) || [],
            companyEmail: payrollFormValues.companyEmail || '',
            startDate: payrollFormValues.startDate?.toISOString() || '',
            arrivalDate: payrollFormValues.arrivalDate?.toISOString() || null,
            employeeFirstDay:
                payrollFormValues.employeeFirstDay?.toISOString() || '',
            employeeLastDay:
                payrollFormValues.employeeLastDay?.toISOString() || null,
        });
    }
}
