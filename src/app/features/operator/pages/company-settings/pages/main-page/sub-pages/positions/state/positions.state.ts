import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom, take, map } from 'rxjs';
import {
    UIStatus,
    UserState,
    CompanyDepartmentListItem,
    CompanyPositionListItem,
    CompanyLocationListItem,
    Department,
    FormattedDepartment,
    CompanyPositionDetail,
    CompanyPositionConfig,
    CompanySettingsApiService,
    UserManagementApiService,
} from '@app/core';

@Injectable()
export class PositionsState {
    userState = inject(UserState);
    companySettingsApiService = inject(CompanySettingsApiService);
    userManagementApiService = inject(UserManagementApiService);
    positionId$ = new BehaviorSubject<number | null>(null);
    departmentList$ = new BehaviorSubject<CompanyDepartmentListItem[]>([]);
    positionList$ = new BehaviorSubject<CompanyPositionListItem[]>([]);
    companyLocationList$ = new BehaviorSubject<CompanyLocationListItem[]>([]);
    departments$ = new BehaviorSubject<FormattedDepartment[]>([]);
    positions$ = new BehaviorSubject<CompanyPositionListItem[]>([]);
    positionDetails$ = new BehaviorSubject<CompanyPositionDetail | undefined>(
        undefined
    );
    statuses$ = new BehaviorSubject<{
        loadCompanyDepartments: UIStatus;
        loadCompanyPositions: UIStatus;
    }>({
        loadCompanyDepartments: 'idle',
        loadCompanyPositions: 'idle',
    });

    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.getLocationList('');
        this.loadDepartments();
        this.loadPositions();
        this.refreshTriggered$.subscribe(() => {
            this.getDepartments();
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    setPositionId(positionId: number) {
        this.positionId$.next(positionId);
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

    private loadDepartments(): Promise<FormattedDepartment[]> {
        const departments = this.departments$.getValue();
        if (departments.length > 0) {
            return Promise.resolve(departments);
        }
        if (this.statuses$.getValue().loadCompanyDepartments === 'loading') {
            return lastValueFrom(this.departments$.pipe(take(1)));
        }
        return this.userState.getAspNetUser().then((user) => {
            const companyId = user?.companyUniqueID;
            if (companyId) {
                this.updateStatus('loadCompanyDepartments', 'loading');
                return lastValueFrom(
                    this.userManagementApiService
                        .loadDepartmentsForCompany(companyId)
                        .pipe(
                            map((res) => {
                                return this.formatDepartments(res.data);
                            })
                        )
                )
                    .then((data) => {
                        this.departments$.next(data);
                        this.updateStatus('loadCompanyDepartments', 'success');
                        return data;
                    })
                    .catch(() => {
                        this.departments$.next([]);
                        this.updateStatus('loadCompanyDepartments', 'error');
                        return Promise.resolve([]);
                    });
            }
            return Promise.resolve([]);
        });
    }
    private formatDepartments(
        departments: Department[]
    ): FormattedDepartment[] {
        if (!departments) {
            return [];
        }
        const rootDepartment = departments.find(
            (department) => department.parentDepartmentId === 0
        );
        const topLevelDepartments = departments.filter(
            (department) => department.parentDepartmentId === 1
        );
        const nonTopLevelDepartments = departments.filter(
            (department) => department.parentDepartmentId > 1
        );
        const formattedDepartmentsObject = topLevelDepartments.reduce<
            Record<number, FormattedDepartment>
        >((acc, curr) => {
            acc[curr.departmentId] = { ...curr, departments: {} };
            return acc;
        }, {});
        // find second tiers
        nonTopLevelDepartments.forEach((department) => {
            const parentDepartmentId = department.parentDepartmentId;
            if (parentDepartmentId in formattedDepartmentsObject) {
                formattedDepartmentsObject[parentDepartmentId].departments[
                    department.departmentId
                ] = {
                    ...department,
                    departments: {},
                };
            }
        });
        // find third tiers
        nonTopLevelDepartments.forEach((department) => {
            const parentDepartmentId = department.parentDepartmentId;
            for (const topLevelDepartment of Object.values(
                formattedDepartmentsObject
            )) {
                if (parentDepartmentId in topLevelDepartment.departments) {
                    formattedDepartmentsObject[
                        topLevelDepartment.departmentId
                    ].departments[parentDepartmentId].departments[
                        department.departmentId
                    ] = {
                        ...department,
                        departments: {},
                    };
                }
            }
        });
        if (rootDepartment) {
            return [
                {
                    ...rootDepartment,
                    departments: formattedDepartmentsObject,
                },
            ];
        }
        return Object.values(formattedDepartmentsObject).reduce<
            FormattedDepartment[]
        >((acc, curr) => {
            acc.push(curr);
            return acc;
        }, []);
    }

    getLocationList(locationType: string): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID ?? '';
        this.updateStatus('loadCompanyPositions', 'loading');
        this.companyLocationList$.next([]);
        return lastValueFrom(
            this.companySettingsApiService.getCompanyLocationList(
                companyID,
                locationType
            )
        )
            .then((res) => {
                this.updateStatus('loadCompanyPositions', 'success');
                this.companyLocationList$.next(res.data);
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('loadCompanyPositions', 'error');
                return Promise.reject(error);
            });
    }

    getPositions(departmentId: number): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID ?? '';
        this.updateStatus('loadCompanyPositions', 'loading');
        this.positionList$.next([]);
        return lastValueFrom(
            this.companySettingsApiService.getPositionsForDepartment(
                companyID,
                departmentId
            )
        )
            .then((res) => {
                this.updateStatus('loadCompanyPositions', 'success');
                this.positionList$.next(res.data);
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('loadCompanyPositions', 'error');
                return Promise.reject(error);
            });
    }

    loadPositions(): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID ?? '';
        this.updateStatus('loadCompanyPositions', 'loading');
        this.positions$.next([]);
        return lastValueFrom(
            this.userManagementApiService.getCompanyPositions(companyID)
        )
            .then((res) => {
                this.updateStatus('loadCompanyPositions', 'success');
                this.positions$.next(res.data);
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('loadCompanyPositions', 'error');
                return Promise.reject(error);
            });
    }

    getPositionDetail(positionId: number): Promise<void> {
        const companyID =
            this.userState.aspNetUser$.getValue()?.companyUniqueID ?? '';
        this.updateStatus('loadCompanyPositions', 'loading');
        this.positionDetails$.next(undefined);
        return lastValueFrom(
            this.companySettingsApiService.getPositionDetail(
                positionId,
                companyID
            )
        )
            .then((res) => {
                this.updateStatus('loadCompanyPositions', 'success');
                this.positionDetails$.next(res.data);
                return Promise.resolve();
            })
            .catch((error) => {
                this.updateStatus('loadCompanyPositions', 'error');
                return Promise.reject(error);
            });
    }

    savePosition(config: CompanyPositionConfig): Promise<void> {
        this.updateStatus('saveCompanyPositions', 'loading');
        return this.userState.getAspNetUser().then((user) => {
            return lastValueFrom(
                this.companySettingsApiService.savePosition({
                    ...config,
                    companyUniqueId: user?.companyUniqueID ?? '',
                })
            )
                .then((res) => {
                    if (res.success) {
                        this.refresh();
                        this.updateStatus('saveCompanyPositions', 'success');
                        return Promise.resolve();
                    } else {
                        return Promise.reject(res.error);
                    }
                })
                .catch(() => {
                    this.updateStatus('saveCompanyPositions', 'error');
                });
        });
    }

    deletePosition(equipmentTypeId: number, isActive: boolean): Promise<void> {
        return lastValueFrom(
            this.companySettingsApiService.deletePosition(
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
        key:
            | 'loadCompanyDepartments'
            | 'loadCompanyPositions'
            | 'saveCompanyPositions',
        status: 'idle' | 'loading' | 'success' | 'error'
    ): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
