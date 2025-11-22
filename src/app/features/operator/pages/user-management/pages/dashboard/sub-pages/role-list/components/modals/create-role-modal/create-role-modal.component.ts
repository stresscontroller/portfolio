import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RoleListState, UIState } from '../../../state';
import { UIStatus } from '@app/core';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    standalone: true,
    selector: 'app-create-role-modal',
    templateUrl: './create-role-modal.component.html',
    styleUrls: ['./create-role-modal.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DropdownModule,
        ButtonModule,
        InputTextModule,
        DividerModule,
    ],
})
export class CreateRoleModalComponent {
    uiState = inject(UIState);
    roleListState = inject(RoleListState);

    createRoleModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.createRole),
        distinctUntilChanged()
    );

    isOpen$ = this.createRoleModal$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    roles$ = this.roleListState.roles$;

    newRoleForm = new FormGroup({
        roleName: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        copyFromRoleId: new FormControl<string>('', {
            nonNullable: true,
        }),
    });

    close() {
        this.newRoleForm.reset();
        this.uiState.closeCreateRoleModal();
    }

    save(): void {
        if (!this.newRoleForm.valid) {
            Object.values(this.newRoleForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        this.status$.next('loading');
        this.roleListState
            .createNewRole(this.newRoleForm.getRawValue().roleName)
            .then((role) => {
                if (role?.id && this.newRoleForm.getRawValue().copyFromRoleId) {
                    return this.roleListState.copyFeaturesFromRole({
                        copyFrom: this.newRoleForm.getRawValue().copyFromRoleId,
                        copyTo: role.id,
                    });
                }
                return Promise.resolve();
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
