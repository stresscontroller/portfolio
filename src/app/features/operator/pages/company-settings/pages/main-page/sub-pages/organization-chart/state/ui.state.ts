import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompanyOrgChart, PositionList } from '@app/core';

type ViewOrgUsersContext =
    | PositionList
    | (CompanyOrgChart & { variant: 'all' | 'department' });

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        viewOrgUsers: {
            isOpen: boolean;
            context?: ViewOrgUsersContext;
        };
    }>({
        viewOrgUsers: {
            isOpen: false,
        },
    });

    openViewOrgModal(context: ViewOrgUsersContext): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            viewOrgUsers: {
                isOpen: true,
                context,
            },
        });
    }

    closeViewOrgModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            viewOrgUsers: {
                isOpen: false,
            },
        });
    }
}
