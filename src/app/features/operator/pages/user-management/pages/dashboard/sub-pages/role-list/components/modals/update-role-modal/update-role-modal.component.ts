import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    map,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RoleListState, UIState } from '../../../state';
import { Role, UIStatus } from '@app/core';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    standalone: true,
    selector: 'app-update-role-modal',
    templateUrl: './update-role-modal.component.html',
    styleUrls: ['./update-role-modal.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        DividerModule,
        MultiSelectModule,
    ],
})
export class UpdateRoleModalComponent {
    uiState = inject(UIState);
    roleListState = inject(RoleListState);
    authRoles$ = this.roleListState.authRoles$;

    updateRoleModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.updateRole),
        distinctUntilChanged()
    );

    isOpen$ = this.updateRoleModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.updateRoleModal$.pipe(map((modal) => modal.context));
    status$ = new BehaviorSubject<UIStatus>('idle');

    updateRoleForm = new FormGroup({
        roleName: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        authRoles: new FormControl<string[]>([], { nonNullable: true }),
        isActive: new FormControl<boolean>(false, {
            nonNullable: true,
        }),
    });

    private role: Role | undefined = undefined;
    private isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.context$
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((context) => {
                this.role = context;
                if (this.role?.id) {
                    this.roleListState
                        .fetchAssociatedAuthRole(this.role.id)
                        .then((associatedAuthRoles) => {
                            this.updateRoleForm.patchValue({
                                authRoles: associatedAuthRoles.map(
                                    (role) => role.id
                                ),
                            });
                        });
                }
                if (context) {
                    this.updateRoleForm.reset({
                        roleName: context.name,
                        isActive: context.isActive,
                    });
                } else {
                    this.updateRoleForm.reset();
                }
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    close() {
        this.updateRoleForm.reset();
        this.uiState.closeUpdateRoleModal();
    }

    save(): void {
        if (!this.role) {
            return;
        }
        if (!this.updateRoleForm.valid) {
            Object.values(this.updateRoleForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        this.status$.next('loading');
        const formValue = this.updateRoleForm.getRawValue();
        this.roleListState
            .updateRoleDetails({
                ...this.role,
                name: formValue.roleName,
                isActive: formValue.isActive,
            })
            .then(() => {
                return this.roleListState.updateAuthRole(
                    this.role!.id,
                    formValue.authRoles
                );
            })
            .then(() => {
                this.status$.next('idle');
                this.roleListState.fetchAllAvailableRoles();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
