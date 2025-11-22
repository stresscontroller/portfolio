import { Injectable, inject } from '@angular/core';
import {
    UserState,
    UserManagementApiService,
    UserPayrollApiService,
    UserNotesListItem,
    LocationData,
    Department,
    DepartmentPosition,
    PayrollListItem,
    PositionInfo,
    DepartmentInfo,
    UIStatus,
    PayrollItemConfig,
    FormattedDepartment,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, map, take } from 'rxjs';

@Injectable()
export class PayrollState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);
    userPayrollApiService = inject(UserPayrollApiService);

    // data
    notes$ = new BehaviorSubject<UserNotesListItem[]>([]);
    locations$ = new BehaviorSubject<LocationData[]>([]);
    departments$ = new BehaviorSubject<FormattedDepartment[]>([]);
    positions$ = new BehaviorSubject<Record<number, DepartmentPosition[]>>({});
    payrollDetails$ = new BehaviorSubject<PayrollListItem | undefined>(
        undefined
    );

    // status
    statuses$ = new BehaviorSubject<{
        locations: UIStatus;
        departments: UIStatus;
        positions: UIStatus;
        payRateAmount: UIStatus;
        payrollDetails: UIStatus;
        save: UIStatus;
    }>({
        locations: 'idle',
        departments: 'idle',
        positions: 'idle',
        payRateAmount: 'idle',
        payrollDetails: 'idle',
        save: 'idle',
    });

    // local state
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.userState.aspNetUser$.subscribe((user) => {
            const userId = user?.id;
            if (userId) {
                this.loadLocations();
                this.loadDepartments();

                // reset
                this.payrollDetails$.next(undefined);

                if (userId) {
                    this.loadPayrollDetails(userId);
                }
            }
        });
    }

    loadPayRateAmount(positionId: number): Promise<number | null> {
        return this.userState.getAspNetUser().then((user) => {
            const companyUniqueId = user?.companyUniqueID;
            if (companyUniqueId) {
                this.updateStatus('payRateAmount', 'loading');
                return lastValueFrom(
                    this.userPayrollApiService
                        .loadPayRateAmount(companyUniqueId, positionId)
                        .pipe(map((res) => res.data || null))
                )
                    .then((data) => {
                        this.updateStatus('payRateAmount', 'success');
                        return Promise.resolve(data);
                    })
                    .catch(() => {
                        this.updateStatus('payRateAmount', 'error');
                        return Promise.resolve(null);
                    });
            }
            return Promise.resolve(null);
        });
    }

    loadPositions(departmentId: number): Promise<DepartmentPosition[]> {
        const positions = this.positions$.getValue();
        if (positions[departmentId]?.length > 0) {
            return Promise.resolve(positions[departmentId]);
        }
        return this.userState.getAspNetUser().then((user) => {
            const companyUniqueId = user?.companyUniqueID;
            if (companyUniqueId) {
                this.updateStatus('positions', 'loading');
                return lastValueFrom(
                    this.userManagementApiService
                        .loadPositionsForDepartment(
                            companyUniqueId,
                            departmentId
                        )
                        .pipe(
                            map(
                                (res) =>
                                    res.data?.reduce<DepartmentPosition[]>(
                                        (acc, curr) => {
                                            acc.push(curr);
                                            if (curr.children) {
                                                acc.push(...curr.children);
                                            }
                                            return acc;
                                        },
                                        []
                                    ) || []
                            )
                        )
                )
                    .then((data) => {
                        this.positions$.next({
                            ...this.positions$.getValue(),
                            [departmentId]: data,
                        });
                        this.updateStatus('positions', 'success');
                        return Promise.resolve(data);
                    })
                    .catch(() => {
                        this.updateStatus('positions', 'error');
                        return Promise.resolve([]);
                    });
            }
            return Promise.resolve([]);
        });
    }

    departmentInfoInitial: DepartmentInfo = {
        companyEmail: '',
        employeeFirstDay: '',
        employeeLastDay: '',
    };
    departmentData$ = new BehaviorSubject<DepartmentInfo>(
        this.departmentInfoInitial
    );
    updateDepartmentForm(departmentFormData: DepartmentInfo): void {
        this.departmentData$.next(departmentFormData);
    }

    positionInfoInitial: PositionInfo = {
        location: 0,
        startDate: '',
        arrivalDate: '',
    };
    positionData$ = new BehaviorSubject<PositionInfo>(this.positionInfoInitial);
    updatePositionFrom(positionFormData: PositionInfo): void {
        this.positionData$.next(positionFormData);
    }

    saveUserPayroll(payrollData: PayrollItemConfig): Promise<void> {
        this.updateStatus('save', 'loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                const userId = payrollData.userId || user?.id;
                if (!userId || !user?.companyUniqueID) {
                    return Promise.reject('no userid');
                }
                return lastValueFrom(
                    this.userPayrollApiService.saveUserPayrollData({
                        ...payrollData,
                        userId: userId,
                        companyId: user.companyUniqueID,
                    })
                ).then((res) => {
                    if (res.success) {
                        this.loadPayrollDetails(userId);
                        this.updateStatus('save', 'idle');
                        return Promise.resolve();
                    }
                    return Promise.reject(res.errors);
                });
            })
            .catch(() => {
                this.updateStatus('save', 'error');
                return Promise.resolve();
            });
    }

    private loadLocations(): Promise<LocationData[]> {
        const locations = this.locations$.getValue();
        if (locations.length > 0) {
            return Promise.resolve(locations);
        }
        if (this.statuses$.getValue().locations === 'loading') {
            return lastValueFrom(this.locations$.pipe(take(1)));
        }

        return this.userState.getAspNetUser().then((user) => {
            const companyId = user?.companyUniqueID;
            if (companyId) {
                this.updateStatus('locations', 'loading');
                return lastValueFrom(
                    this.userManagementApiService
                        .loadLocationData(companyId)
                        .pipe(map((res) => res.data))
                )
                    .then((data) => {
                        this.locations$.next(data);
                        this.updateStatus('locations', 'success');
                        return data;
                    })
                    .catch(() => {
                        this.locations$.next([]);
                        this.updateStatus('locations', 'error');
                        return Promise.resolve([]);
                    });
            }
            return Promise.resolve([]);
        });
    }

    private loadDepartments(): Promise<FormattedDepartment[]> {
        const departments = this.departments$.getValue();
        if (departments.length > 0) {
            return Promise.resolve(departments);
        }
        if (this.statuses$.getValue().departments === 'loading') {
            return lastValueFrom(this.departments$.pipe(take(1)));
        }
        return this.userState.getAspNetUser().then((user) => {
            const companyId = user?.companyUniqueID;
            if (companyId) {
                this.updateStatus('departments', 'loading');
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
                        this.updateStatus('departments', 'success');
                        return data;
                    })
                    .catch(() => {
                        this.departments$.next([]);
                        this.updateStatus('departments', 'error');
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

    private loadPayrollDetails(userId: string): Promise<void> {
        this.updateStatus('payrollDetails', 'loading');
        this.payrollDetails$.next(undefined);
        return lastValueFrom(
            this.userPayrollApiService
                .loadPayrollDetails(userId)
                .pipe(map((res) => res.data))
        )
            .then((data) => {
                this.updateStatus('payrollDetails', 'success');
                this.payrollDetails$.next(data);
            })
            .catch(() => {
                this.updateStatus('payrollDetails', 'error');
            });
    }

    private updateStatus(
        key:
            | 'locations'
            | 'departments'
            | 'positions'
            | 'payRateAmount'
            | 'payrollDetails'
            | 'save',
        status: UIStatus
    ): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
