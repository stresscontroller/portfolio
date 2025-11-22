import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    distinctUntilChanged,
    map,
    BehaviorSubject,
    Subject,
    takeUntil,
    tap,
    filter,
    switchMap,
    of,
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import {
    CompanyOrgChart,
    CompanySettingsApiService,
    OrgChartUser,
    PositionList,
    UIStatus,
} from '@app/core';
import { UIState } from '../../state';
import { LoaderEmbedComponent } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-org-users-modal',
    templateUrl: './org-users-modal.component.html',
    styleUrls: ['./org-users-modal.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        LoaderEmbedComponent,
    ],
})
export class OrgUsersModalComponent {
    uiState = inject(UIState);
    companySettingsApiService = inject(CompanySettingsApiService);
    viewOrgUsersModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.viewOrgUsers),
        distinctUntilChanged()
    );
    isOpen$ = this.viewOrgUsersModal$.pipe(map((modal) => modal.isOpen));

    context$ = this.viewOrgUsersModal$.pipe(map((modal) => modal.context));

    status$ = new BehaviorSubject<UIStatus>('idle');
    departmentInfo$ = new BehaviorSubject<CompanyOrgChart | undefined>(
        undefined
    );
    positionInfo$ = new BehaviorSubject<PositionList | undefined>(undefined);
    users$ = new BehaviorSubject<(OrgChartUser & { initials: string })[]>([]);
    private isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.context$
            .pipe(
                tap((context) => {
                    if (context && 'departmentId' in context) {
                        this.departmentInfo$.next(context);
                    } else if (context && 'positionId' in context) {
                        this.positionInfo$.next(context);
                    } else {
                        this.departmentInfo$.next(undefined);
                        this.positionInfo$.next(undefined);
                    }

                    this.users$.next([]);
                }),
                filter((context) => !!context),
                switchMap((context) => {
                    this.status$.next('loading');
                    if (context) {
                        if ('departmentId' in context) {
                            const departmentId = context.departmentId;
                            if (context.variant === 'department') {
                                return this.companySettingsApiService.getOrganizationChartUsersByDepartment(
                                    departmentId
                                );
                            } else {
                                return this.companySettingsApiService.getOrganizationChartTotalStaffByDepartment(
                                    departmentId
                                );
                            }
                        }
                        if ('positionId' in context) {
                            return this.companySettingsApiService.getOrganizationChartUsersByPosition(
                                context.positionId
                            );
                        }
                    }
                    return of({ data: [] });
                }),
                map((res) => {
                    return res?.data || [];
                }),
                takeUntil(this.isDestroyed$)
            )
            .subscribe((users) => {
                this.status$.next('idle');
                this.users$.next(
                    users
                        .map((user) => ({
                            ...user,
                            initials: `${
                                user.firstName ? user.firstName.slice(0, 1) : ''
                            }${user.lastName ? user.lastName.slice(0, 1) : ''}`,
                        }))
                        .sort((a, b) => a.firstName.localeCompare(b.firstName))
                );
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeViewOrgModal();
    }
}
