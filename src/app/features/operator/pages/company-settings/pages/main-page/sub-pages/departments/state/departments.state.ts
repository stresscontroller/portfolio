import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

import {
    UIStatus,
    UserState,
    CompanyDepartmentListItem,
    CompanySettingsApiService,
    CompanyDepartmentConfig,
} from '@app/core';

@Injectable()
export class DepartmentsState {
    userState = inject(UserState);
    companySettingsApiService = inject(CompanySettingsApiService);
    departmentList$ = new BehaviorSubject<CompanyDepartmentListItem[]>([]);

    statuses$ = new BehaviorSubject<{
        loadCompanyDepartments: UIStatus;
        saveCompanyDepartment: UIStatus;
    }>({
        loadCompanyDepartments: 'idle',
        saveCompanyDepartment: 'idle',
    });

    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.refreshTriggered$.subscribe(() => {
            this.getDepartments();
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    getDepartments(): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID ?? '';
        this.updateStatus('loadCompanyDepartments', 'loading');
        this.departmentList$.next([]);
        return lastValueFrom(
            this.companySettingsApiService.getDepartmentsForCompany(companyID)
        )
            .then((res) => {
                this.updateStatus('loadCompanyDepartments', 'success');
                this.departmentList$.next(res.data);
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('loadCompanyDepartments', 'error');
                return Promise.reject(error);
            });
    }

    saveDepartment(config: CompanyDepartmentConfig): Promise<void> {
        this.updateStatus('saveCompanyDepartment', 'loading');
        return this.userState.getAspNetUser().then((user) => {
            return lastValueFrom(
                this.companySettingsApiService.saveDepartment({
                    ...config,
                    companyUniqueId: user?.companyUniqueID ?? '',
                })
            )
                .then((res) => {
                    if (res.success) {
                        this.refresh();
                        this.updateStatus('saveCompanyDepartment', 'success');

                        return Promise.resolve();
                    } else {
                        return Promise.reject(res.error);
                    }
                })
                .catch(() => {
                    this.updateStatus('saveCompanyDepartment', 'error');
                });
        });
    }

    deleteDepartment(
        equipmentTypeId: number,
        isActive: boolean
    ): Promise<void> {
        return lastValueFrom(
            this.companySettingsApiService.deleteDepartment(
                equipmentTypeId,
                isActive
            )
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.error);
            }
            this.refresh();
            return Promise.resolve();
        });
    }

    private updateStatus(
        key: 'loadCompanyDepartments' | 'saveCompanyDepartment',
        status: 'idle' | 'loading' | 'success' | 'error'
    ): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
