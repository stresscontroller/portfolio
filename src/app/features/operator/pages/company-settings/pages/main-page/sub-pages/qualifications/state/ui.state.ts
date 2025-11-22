import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompanyQualificationListItem } from '@app/core';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewQualification: {
            isOpen: boolean;
        };
        editQualification: {
            isOpen: boolean;
            context?: CompanyQualificationListItem;
        };
        removeQualification: {
            isOpen: boolean;
            context?: CompanyQualificationListItem;
        };
    }>({
        addNewQualification: {
            isOpen: false,
        },
        editQualification: {
            isOpen: false,
        },
        removeQualification: {
            isOpen: false,
        },
    });

    openAddNewQualificationModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewQualification: {
                isOpen: true,
            },
        });
    }

    closeAddNewQualificationModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewQualification: {
                isOpen: false,
            },
        });
    }

    openEditQualificationModal(context: CompanyQualificationListItem) {
        this.modals$.next({
            ...this.modals$.value,
            editQualification: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditQualificationModal() {
        this.modals$.next({
            ...this.modals$.value,
            editQualification: {
                isOpen: false,
            },
        });
    }

    openRemoveQualificationModal(context: CompanyQualificationListItem) {
        this.modals$.next({
            ...this.modals$.value,
            removeQualification: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveQualificationModal() {
        this.modals$.next({
            ...this.modals$.value,
            removeQualification: {
                isOpen: false,
            },
        });
    }
}
