import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Department, Features } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';

import { Subject, map, BehaviorSubject } from 'rxjs';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AspNetUserModel } from '@app/core';

import { CommunicationsState } from './communications.state';

@Component({
    standalone: true,
    selector: 'app-communications',
    templateUrl: './communications.component.html',
    styleUrls: ['./communications.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputSwitchModule,
        MultiSelectModule,
        InputTextModule,
        InputTextareaModule,
        ButtonModule,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
    providers: [CommunicationsState],
})
export class CommunicationsComponent {
    features = Features;
    communicationsState = inject(CommunicationsState);
    communicationsForm = new FormGroup({
        departmentId: new FormControl<number[] | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        positionId: new FormControl<number[] | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        users: new FormControl<string[] | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        subject: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        content: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        isActive: new FormControl<boolean>(true),
        isHired: new FormControl<boolean>(true),
    });
    private isDestroyed$ = new Subject<void>();
    statuses$ = this.communicationsState.statuses$;
    departments$ = this.communicationsState.departments$.pipe(
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
    departmentsArr: number[] = [];
    positions$ = this.communicationsState.positions$.pipe(
        map((positionsRecord) => Object.values(positionsRecord).flat())
    );
    users$ = new BehaviorSubject<AspNetUserModel[]>([]);

    ngOnInit(): void {
        this.communicationsState.init();
    }

    loadPositions() {
        this.communicationsForm.controls['positionId'].setValue(null);
        this.communicationsForm.controls['users'].setValue(null);
        const formValues = this.communicationsForm.getRawValue();
        if (formValues.departmentId) {
            if (formValues.departmentId.length > this.departmentsArr.length) {
                const newDepartmentId = formValues.departmentId.filter(
                    (departmentIds) =>
                        !this.departmentsArr.includes(departmentIds)
                );
                this.communicationsState.loadPositions(newDepartmentId[0]);
            } else if (
                formValues.departmentId.length < this.departmentsArr.length
            ) {
                const oldDepartmentId = this.departmentsArr.filter(
                    (departmentIds) =>
                        !formValues.departmentId!.includes(departmentIds)
                );
                this.communicationsState.removePositionsByDepartmentId(
                    oldDepartmentId[0]
                );
            }
            this.departmentsArr = formValues.departmentId;
        }
    }

    loadUsers() {
        this.communicationsForm.controls['users'].setValue(null);
        const formValues = this.communicationsForm.getRawValue();
        this.communicationsState.users$
            .pipe(
                map((users) =>
                    users
                        .filter(
                            (user) =>
                                user.aspNetUserModel.isActive ===
                                    formValues.isActive &&
                                user.aspNetUserModel.isEmployee ===
                                    formValues.isHired
                        )
                        .filter((user) =>
                            user.positions.some((position) =>
                                formValues.positionId?.includes(
                                    position.positionId
                                )
                            )
                        )
                        .map((user) => user.aspNetUserModel)
                )
            )
            .subscribe((filteredUsers) => {
                this.users$.next(filteredUsers);
            });
    }

    sendMessage() {
        if (this.communicationsForm.invalid) {
            Object.values(this.communicationsForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.communicationsForm.getRawValue();
        this.communicationsState
            .sendMessage({
                subject: formValues.subject ?? '',
                message: formValues.content ?? '',
                from: '',
                isBodyHtml: true,
                to: formValues.users ?? [],
            })
            .then(() => {
                this.clear();
            });
    }

    clear() {
        this.communicationsForm.reset();
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }
}
