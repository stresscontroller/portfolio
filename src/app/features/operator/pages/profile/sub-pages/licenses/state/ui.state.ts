import { Injectable } from '@angular/core';
import { UserQualificationListItem } from '@app/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addLicense: {
            isOpen: boolean;
        };
        editLicense: {
            isOpen: boolean;
            context?: UserQualificationListItem;
        };
        deleteLicense: {
            isOpen: boolean;
            context?: UserQualificationListItem;
        };
    }>({
        addLicense: {
            isOpen: false,
        },
        editLicense: {
            isOpen: false,
        },
        deleteLicense: {
            isOpen: false,
        },
    });

    openAddLicenseModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addLicense: {
                isOpen: true,
            },
        });
    }

    closeAddLicenseModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            addLicense: {
                isOpen: false,
            },
        });
    }

    openEditLicenseModal(context: UserQualificationListItem): void {
        this.modals$.next({
            ...this.modals$.value,
            editLicense: {
                isOpen: true,
                context,
            },
        });
    }
    closeEditLicenseModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            editLicense: {
                isOpen: false,
            },
        });
    }

    openRemoveLicenseModal(context: UserQualificationListItem): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteLicense: {
                isOpen: true,
                context,
            },
        });
    }

    closeRemoveLicenseModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteLicense: {
                isOpen: false,
            },
        });
    }
}
