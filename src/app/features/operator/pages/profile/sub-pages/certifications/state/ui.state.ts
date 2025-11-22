import { Injectable } from '@angular/core';
import { UserCertificationsData } from '@app/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewCertifications: {
            isOpen: boolean;
        };
        editCertifications: {
            isOpen: boolean;
            context?: UserCertificationsData;
        };
        removeCertifications: {
            isOpen: boolean;
            context?: UserCertificationsData;
        };
    }>({
        addNewCertifications: {
            isOpen: false,
        },
        editCertifications: {
            isOpen: false,
        },
        removeCertifications: {
            isOpen: false,
        },
    });

    openAddNewCertificationsModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewCertifications: {
                isOpen: true,
            },
        });
    }

    closeAddNewCertificationsModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addNewCertifications: {
                isOpen: false,
            },
        });
    }

    openEditCertificationsModal(context: UserCertificationsData): void {
        this.modals$.next({
            ...this.modals$.value,
            editCertifications: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditCertificationsModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            editCertifications: {
                isOpen: false,
            },
        });
    }

    openRemoveCertificationsModal(context: UserCertificationsData): void {
        this.modals$.next({
            ...this.modals$.value,
            removeCertifications: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveCertificationsModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            removeCertifications: {
                isOpen: false,
            },
        });
    }
}
