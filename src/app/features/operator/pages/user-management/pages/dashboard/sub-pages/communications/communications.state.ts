import { Injectable, inject } from '@angular/core';
import {
    UserState,
    UIStatus,
    FormattedDepartment,
    DepartmentPosition,
    Department,
    CommunicationsConfig,
    UserListItemWithDepartmentsPositions,
    UserHousingApiService,
    UserManagementApiService,
} from '@app/core';
import { BehaviorSubject, lastValueFrom, map, take } from 'rxjs';

import { UIState } from '@app/core';

@Injectable()
export class CommunicationsState {
    uiState = inject(UIState);
    userState = inject(UserState);

    UserHousingApiService = inject(UserHousingApiService);
    userManagementApiService = inject(UserManagementApiService);

    statuses$ = new BehaviorSubject<{
        departments: UIStatus;
        positions: UIStatus;
        users: UIStatus;
        save: UIStatus;
    }>({
        departments: 'idle',
        positions: 'idle',
        users: 'idle',
        save: 'idle',
    });

    departments$ = new BehaviorSubject<FormattedDepartment[]>([]);
    positions$ = new BehaviorSubject<Record<number, DepartmentPosition[]>>({});
    users$ = new BehaviorSubject<UserListItemWithDepartmentsPositions[]>([]);

    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.loadDepartments();
        this.loadUsers();
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
                        .loadCompanyDepartments(companyId)
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

    removePositionsByDepartmentId(departmentId: number) {
        const currentPositions = this.positions$.getValue();
        const { [departmentId]: removed, ...newPositions } = currentPositions;
        console.log(removed);
        this.positions$.next(newPositions);
    }

    loadUsers(): Promise<void> {
        this.users$.next([]);
        this.updateStatus('users', 'loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (user?.companyUniqueID) {
                    return lastValueFrom(
                        this.userManagementApiService.getUsersWithPositionData(
                            user?.companyUniqueID
                        )
                    ).then((res) => {
                        return Promise.resolve(res.data);
                    });
                }
                return Promise.reject('missing agent information');
            })
            .then((users) => {
                this.updateStatus('users', 'success');
                this.users$.next(users);
                return Promise.resolve();
            })
            .catch(() => {
                this.updateStatus('users', 'error');
                return Promise.resolve();
            });
    }

    sendMessage(config: CommunicationsConfig): Promise<void> {
        this.updateStatus('save', 'loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (user) {
                    return lastValueFrom(
                        this.userManagementApiService.sendMessage({
                            ...config,
                            from: user.email,
                        })
                    ).then((res) => {
                        return Promise.resolve(res.data);
                    });
                }
                return Promise.reject('missing agent information');
            })
            .then(() => {
                this.updateStatus('save', 'success');
                return Promise.resolve();
            })
            .catch(() => {
                this.updateStatus('save', 'error');
                return Promise.resolve();
            });
    }

    private updateStatus(
        key: 'departments' | 'positions' | 'users' | 'save',
        status: UIStatus
    ): void {
        this.statuses$.next({
            ...this.statuses$.getValue(),
            [key]: status,
        });
    }
}
