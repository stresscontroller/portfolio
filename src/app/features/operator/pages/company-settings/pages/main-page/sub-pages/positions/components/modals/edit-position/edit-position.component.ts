import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, filter } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TabViewModule } from 'primeng/tabview';

import {
    UIStatus,
    Department,
    CompanyDepartmentListItem,
    CompanyPositionListItem,
} from '@app/core';
import { UIState, PositionsState, PayRatesState } from '../../../state';
import { PayRatesTableComponent } from '../../tables';
import { LoaderEmbedComponent } from '@app/shared';
@Component({
    standalone: true,
    selector: 'app-edit-position-modal',
    templateUrl: './edit-position.component.html',
    styleUrls: ['./edit-position.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        CheckboxModule,
        InputTextareaModule,
        TabViewModule,
        PayRatesTableComponent,
        LoaderEmbedComponent,
    ],
})
export class EditPositionModalComponent {
    uiState = inject(UIState);
    positionsState = inject(PositionsState);
    payRatesState = inject(PayRatesState);
    editPosition$ = this.uiState.modals$.pipe(
        map((modals) => modals.editPosition),
        distinctUntilChanged()
    );
    isOpen$ = this.editPosition$.pipe(map((modal) => modal.isOpen));
    context$ = this.editPosition$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    companyLocationList$ = this.positionsState.companyLocationList$;
    positionTypeList: string[] = [
        'Full-Time Seasonal',
        'Part-Time Seasonal',
        'Full-Time Year-Round',
        'Part-Time Year-Round',
        'Short-Term Contract (less than 3 month)',
        'Long-Term Contract (longer than 3 month)',
    ];
    departments$ = this.positionsState.departments$.pipe(
        map((deps) => {
            const flatDep: (Department & { tier: string })[] = [];
            deps.forEach((dep) => {
                flatDep.push({ ...dep, tier: 'first' });
                Object.values(dep.departments).forEach((secondTierDep) => {
                    flatDep.push({ ...secondTierDep, tier: 'second' });
                    Object.values(secondTierDep.departments).forEach(
                        (thirdTierDep) => {
                            flatDep.push({ ...thirdTierDep, tier: 'third' });
                            Object.values(thirdTierDep.departments).forEach(
                                (fourthTierDep) => {
                                    flatDep.push({
                                        ...fourthTierDep,
                                        tier: 'fourth',
                                    });
                                }
                            );
                        }
                    );
                });
            });
            return flatDep;
        })
    );
    reportToList$ = new BehaviorSubject<CompanyPositionListItem[]>([]);
    payRateList$ = this.payRatesState.payRateList$;

    statuses$ = new BehaviorSubject<{
        loadPositionDetail: UIStatus;
        loadPayRateList: UIStatus;
        savePosition: UIStatus;
    }>({
        loadPositionDetail: 'idle',
        loadPayRateList: 'idle',
        savePosition: 'idle',
    });

    editPositionForm = new FormGroup({
        positionName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        basePayRate: new FormControl<string | null>(null),
        locationID: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        positionType: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        departmentId: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        managerPositionId: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        isManager: new FormControl<boolean | null>(null),
        isRootLevel: new FormControl<boolean | null>(null),
        numberofStaffNeeded: new FormControl<number | null>(null),
        shortDesc: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        longDesc: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        requirements: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
    });

    getReportToList(): void {
        const formValues = this.editPositionForm.getRawValue();
        this.positionsState.departmentList$.subscribe((departments) => {
            const departmentMap = new Map<number, CompanyDepartmentListItem>();
            const currentDepartment = this.findDepartmentById(
                formValues.departmentId ?? 0,
                departments
            );
            const parentDepartments = this.findParentDepartments(
                formValues.departmentId ?? 0,
                departments
            );
            if (currentDepartment) {
                departmentMap.set(
                    currentDepartment.departmentId,
                    currentDepartment
                );
            }
            for (const department of parentDepartments) {
                departmentMap.set(department.departmentId, department);
            }

            this.positionsState.positions$.subscribe((positions) => {
                const mappositions = positions.filter(
                    (position) =>
                        departmentMap.has(position.departmentId) &&
                        position.isManager === true
                );
                this.reportToList$.next(mappositions);
            });
        });
    }

    findDepartmentById(
        departmentId: number,
        departments: CompanyDepartmentListItem[]
    ): CompanyDepartmentListItem | undefined {
        return departments.find(
            (department) => department.departmentId === departmentId
        );
    }

    findParentDepartments(
        departmentId: number,
        departments: CompanyDepartmentListItem[]
    ): CompanyDepartmentListItem[] {
        const department = this.findDepartmentById(departmentId, departments);
        if (!department || department.parentDepartmentId === 0) {
            return [];
        }
        const parent = this.findDepartmentById(
            department.parentDepartmentId,
            departments
        );
        return parent
            ? [
                  parent,
                  ...this.findParentDepartments(
                      parent.departmentId,
                      departments
                  ),
              ]
            : [];
    }

    ngOnInit(): void {
        this.positionsState.positionId$.subscribe((positionId) => {
            if (positionId) {
                this.updateStatus('loadPositionDetail', 'loading');
                this.updateStatus('loadPayRateList', 'loading');
                this.payRatesState
                    .getPayRateList(positionId)
                    .then(() => {
                        this.updateStatus('loadPayRateList', 'success');
                    })
                    .catch(() => {
                        this.updateStatus('loadPayRateList', 'error');
                    });
                this.positionsState
                    .getPositionDetail(positionId)
                    .then(() => {
                        this.setupForm();
                    })
                    .catch(() => {
                        this.updateStatus('loadPositionDetail', 'error');
                    });
            }
        });
    }

    setupForm(): void {
        this.positionsState.positionDetails$.subscribe((detail) => {
            this.editPositionForm.patchValue({
                ...detail,
            });
        });
        this.getReportToList();
        this.updateStatus('loadPositionDetail', 'success');
    }

    save(): void {
        if (this.editPositionForm.invalid) {
            Object.values(this.editPositionForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        this.updateStatus('savePosition', 'loading');
        const formValues = this.editPositionForm.getRawValue();
        this.positionsState
            .savePosition({
                positionId: this.positionsState.positionId$.getValue() ?? 0,
                positionName: formValues.positionName ?? '',
                companyUniqueId: '',
                locationID: formValues.locationID ?? 0,
                positionType: formValues.positionType ?? '',
                departmentId: formValues.departmentId ?? 0,
                managerPositionId: formValues.managerPositionId ?? 0,
                isManager: formValues.isManager ?? true,
                isRootLevel: formValues.isRootLevel ?? true,
                numberofStaffNeeded: formValues.numberofStaffNeeded ?? 0,
                shortDesc: formValues.shortDesc ?? '',
                longDesc: formValues.longDesc ?? '',
                requirements: formValues.requirements ?? '',
                createdBy: '',
            })
            .then(() => {
                this.updateStatus('savePosition', 'success');
                this.close();
            })
            .catch(() => {
                this.updateStatus('savePosition', 'error');
            });
    }

    close(): void {
        this.updateStatus('savePosition', 'idle');
        this.uiState.closeEditPositionModal();
        this.editPositionForm.reset();
    }

    private updateStatus(
        key: 'loadPositionDetail' | 'loadPayRateList' | 'savePosition',
        status: 'idle' | 'loading' | 'success' | 'error'
    ): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
