import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompanyDepartmentListItem } from '@app/core';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addChildDepartment: {
            isOpen: boolean;
            context?: CompanyDepartmentListItem;
        };
        editDepartment: {
            isOpen: boolean;
            context?: CompanyDepartmentListItem;
        };
        removeDepartment: {
            isOpen: boolean;
            context?: CompanyDepartmentListItem;
        };
    }>({
        addChildDepartment: {
            isOpen: false,
        },
        editDepartment: {
            isOpen: false,
        },
        removeDepartment: {
            isOpen: false,
        },
    });

    openAddChildDepartmentModal(context: CompanyDepartmentListItem) {
        this.modals$.next({
            ...this.modals$.value,
            addChildDepartment: {
                isOpen: true,
                context,
            },
        });
    }

    closeAddChildDepartmentModal() {
        this.modals$.next({
            ...this.modals$.value,
            addChildDepartment: {
                isOpen: false,
            },
        });
    }

    openEditDepartmentModal(context: CompanyDepartmentListItem) {
        this.modals$.next({
            ...this.modals$.value,
            editDepartment: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditDepartmentModal() {
        this.modals$.next({
            ...this.modals$.value,
            editDepartment: {
                isOpen: false,
            },
        });
    }

    openRemoveDepartmentModal(context: CompanyDepartmentListItem) {
        this.modals$.next({
            ...this.modals$.value,
            removeDepartment: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveDepartmentModal() {
        this.modals$.next({
            ...this.modals$.value,
            removeDepartment: {
                isOpen: false,
            },
        });
    }
}
