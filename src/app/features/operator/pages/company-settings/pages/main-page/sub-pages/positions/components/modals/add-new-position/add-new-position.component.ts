import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {
    UIStatus,
    Department,
    CompanyDepartmentListItem,
    CompanyPositionListItem,
} from '@app/core';
import { UIState, PositionsState } from '../../../state';
@Component({
    standalone: true,
    selector: 'app-add-new-position-modal',
    templateUrl: './add-new-position.component.html',
    styleUrls: ['./add-new-position.component.scss'],
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
    ],
})
export class AddNewPositionModalComponent {
    uiState = inject(UIState);
    positionsState = inject(PositionsState);
    addNewPosition$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewPosition),
        distinctUntilChanged()
    );
    isOpen$ = this.addNewPosition$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');

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

    addNewPositionForm = new FormGroup({
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

    ngOnInit(): void {
        this.addNewPositionForm.get('basePayRate')?.disable();
        this.addNewPositionForm
            .get('departmentId')
            ?.valueChanges.subscribe(() => {
                this.getReportToList();
            });
    }

    getReportToList(): void {
        const formValues = this.addNewPositionForm.getRawValue();
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

    add(): void {
        if (this.addNewPositionForm.invalid) {
            Object.values(this.addNewPositionForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.addNewPositionForm.getRawValue();
        this.positionsState
            .savePosition({
                positionId: 0,
                positionName: formValues.positionName ?? '',
                companyUniqueId: '',
                locationID: formValues.locationID ?? 0,
                positionType: formValues.positionType ?? '',
                departmentId: formValues.departmentId ?? 0,
                managerPositionId: formValues.managerPositionId ?? 0,
                isManager: formValues.isManager ?? false,
                isRootLevel: formValues.isRootLevel ?? false,
                numberofStaffNeeded: formValues.numberofStaffNeeded ?? 0,
                shortDesc: formValues.shortDesc ?? '',
                longDesc: formValues.longDesc ?? '',
                requirements: formValues.requirements ?? '',
                createdBy: '',
            })
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
    close(): void {
        this.status$.next('idle');
        this.uiState.closeAddNewPositionModal();
        this.addNewPositionForm.reset();
    }
}
