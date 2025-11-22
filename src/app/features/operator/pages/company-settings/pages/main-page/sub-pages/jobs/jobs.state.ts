import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import {
    CompanyDepartmentListItem,
    CompanySettingsApiService,
    ErrorDialogMessages,
    Job,
    JobApplicationModel,
    UIState,
    UIStatus,
    UserState,
} from '@app/core';

@Injectable()
export class JobsState {
    userState = inject(UserState);
    uiState = inject(UIState);
    companySettingService = inject(CompanySettingsApiService);

    jobs$ = new BehaviorSubject<Job[]>([]);
    departments$ = new BehaviorSubject<CompanyDepartmentListItem[]>([]);
    status$ = new BehaviorSubject<UIStatus>('idle');

    config$ = new BehaviorSubject<{
        isActive: boolean;
        refreshTriggered: number;
    }>({
        isActive: true,
        refreshTriggered: 0,
    });

    modals$ = new BehaviorSubject<{
        setJobInactive: {
            isOpen: boolean;
            context?: Job;
        };
        reenableJob: {
            isOpen: boolean;
            context?: Job;
        };
        viewJob: {
            isOpen: boolean;
            context?: Job;
            department?: CompanyDepartmentListItem;
        };
        viewApplicants: {
            isOpen: boolean;
            context?: Job;
            applicants?: JobApplicationModel[];
        };
    }>({
        setJobInactive: {
            isOpen: false,
        },
        reenableJob: {
            isOpen: false,
        },
        viewJob: {
            isOpen: false,
        },
        viewApplicants: {
            isOpen: false,
        },
    });

    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        this.config$.subscribe((config) => {
            this.loadJobs(config.isActive);
            this.loadDepartments();
        });
    }

    loadJobs(isActive: boolean): Promise<void> {
        this.jobs$.next([]);
        this.status$.next('loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (user?.companyUniqueID) {
                    return lastValueFrom(
                        this.companySettingService.getJobList(
                            user.companyUniqueID,
                            isActive
                        )
                    ).then((res) => {
                        return Promise.resolve(res.data);
                    });
                }
                return Promise.reject('missing agent information');
            })
            .then((jobs) => {
                this.status$.next('success');
                this.jobs$.next(jobs);
                return Promise.resolve();
            })
            .catch((error) => {
                this.status$.next('error');
                this.uiState.openErrorDialog({
                    //TODO: Update the errors
                    title: error.errorTitle
                        ? error.errorTitle
                        : ErrorDialogMessages.userManagement.loadUserError
                              .title,
                    description:
                        error?.errors &&
                        Array.isArray(error.errors) &&
                        error.errors.length > 0
                            ? error.errors[0]
                            : ErrorDialogMessages.userManagement.loadUserError
                                  .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .loadUserError.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                // swallow error
                return Promise.resolve();
            });
    }

    loadDepartments(): Promise<void> {
        this.jobs$.next([]);
        this.status$.next('loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (user?.companyUniqueID) {
                    return lastValueFrom(
                        this.companySettingService.getDepartmentsForCompany(
                            user.companyUniqueID
                        )
                    ).then((res) => {
                        return Promise.resolve(res.data);
                    });
                }
                return Promise.reject('missing agent information');
            })
            .then((departments) => {
                this.status$.next('success');
                this.departments$.next(departments);
                return Promise.resolve();
            })
            .catch((error) => {
                this.status$.next('error');
                this.uiState.openErrorDialog({
                    //TODO: Update the errors
                    title: error.errorTitle
                        ? error.errorTitle
                        : ErrorDialogMessages.userManagement.loadUserError
                              .title,
                    description:
                        error?.errors &&
                        Array.isArray(error.errors) &&
                        error.errors.length > 0
                            ? error.errors[0]
                            : ErrorDialogMessages.userManagement.loadUserError
                                  .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .loadUserError.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                // swallow error
                return Promise.resolve();
            });
    }

    openSetJobInactiveModal(context: Job): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            setJobInactive: {
                isOpen: true,
                context,
            },
        });
    }

    closeSetJobInactiveModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            setJobInactive: {
                isOpen: false,
            },
        });
    }

    openReenableJobModal(context: Job): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            reenableJob: {
                isOpen: true,
                context,
            },
        });
    }

    closeReenableJobModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            reenableJob: {
                isOpen: false,
            },
        });
    }

    setJobInactive(job: Job, setInactive: boolean): Promise<void> {
        return lastValueFrom(
            this.companySettingService.deleteJob(job.jobsId, setInactive)
        ).then(() => {
            this.refresh();
            return Promise.resolve();
        });
    }

    openViewJobModal(context: Job): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            viewJob: {
                isOpen: true,
                context,
                department: this.departments$
                    .getValue()
                    .find((x) => x.departmentId == context.departmentId),
            },
        });
    }

    closeViewJobModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            viewJob: {
                isOpen: false,
            },
        });
    }

    openViewApplicantsModal(context: Job): void {
        // TODO: Does this get consumed via the async pipe in the modal? Or is there a different set up needed here?
        lastValueFrom(
            this.companySettingService.getJobApplicationListForJob(
                context.jobsId,
                context.isActive
            )
        )
            .then((res) => {
                if (res) {
                    this.modals$.next({
                        ...this.modals$.getValue(),
                        viewApplicants: {
                            isOpen: true,
                            context,
                            applicants: res.data,
                        },
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    closeViewApplicantsModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            viewApplicants: {
                isOpen: false,
            },
        });
    }

    setFilter(isActive: boolean): void {
        this.config$.next({
            ...this.config$.getValue(),
            isActive,
        });
    }

    refresh(): void {
        this.config$.next({
            ...this.config$.getValue(),
            refreshTriggered: new Date().getTime(),
        });
    }
}
