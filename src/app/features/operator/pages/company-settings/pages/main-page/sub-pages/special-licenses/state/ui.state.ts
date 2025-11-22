import { Injectable } from '@angular/core';
import { CompanySpecialLicenseListItem } from '@app/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addNewSpecialLicense: {
            isOpen: boolean;
        };
        editSpecialLicense: {
            isOpen: boolean;
            context?: CompanySpecialLicenseListItem;
        };
        removeSpecialLicense: {
            isOpen: boolean;
            context?: CompanySpecialLicenseListItem;
        };
    }>({
        addNewSpecialLicense: {
            isOpen: false,
        },
        editSpecialLicense: {
            isOpen: false,
        },
        removeSpecialLicense: {
            isOpen: false,
        },
    });

    openAddNewSpecialLicenseModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewSpecialLicense: {
                isOpen: true,
            },
        });
    }

    closeAddNewSpecialLicenseModal() {
        this.modals$.next({
            ...this.modals$.value,
            addNewSpecialLicense: {
                isOpen: false,
            },
        });
    }

    openEditSpecialLicenseModal(context: CompanySpecialLicenseListItem) {
        this.modals$.next({
            ...this.modals$.value,
            editSpecialLicense: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditSpecialLicenseModal() {
        this.modals$.next({
            ...this.modals$.value,
            editSpecialLicense: {
                isOpen: false,
            },
        });
    }

    openRemoveSpecialLicenseModal(context: CompanySpecialLicenseListItem) {
        this.modals$.next({
            ...this.modals$.value,
            removeSpecialLicense: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveSpecialLicenseModal() {
        this.modals$.next({
            ...this.modals$.value,
            removeSpecialLicense: {
                isOpen: false,
            },
        });
    }
}
