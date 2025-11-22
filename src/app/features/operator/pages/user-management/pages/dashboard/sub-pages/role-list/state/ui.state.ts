import { Injectable } from '@angular/core';
import { Role } from '@app/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        createRole: {
            isOpen: boolean;
        };
        updateRole: {
            isOpen: boolean;
            context?: Role;
        };
    }>({
        createRole: {
            isOpen: false,
        },
        updateRole: {
            isOpen: false,
        },
    });

    openCreateRoleModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            createRole: {
                isOpen: true,
            },
        });
    }

    closeCreateRoleModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            createRole: {
                isOpen: false,
            },
        });
    }

    openUpdateRoleModal(context: Role): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            updateRole: {
                isOpen: true,
                context,
            },
        });
    }

    closeUpdateRoleModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            updateRole: {
                isOpen: false,
            },
        });
    }
}
