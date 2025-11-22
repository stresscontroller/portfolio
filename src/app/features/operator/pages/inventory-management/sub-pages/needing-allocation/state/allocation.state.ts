import { Injectable, inject } from '@angular/core';
import { UserActionsState } from '../../../../tour-dispatch/state';
import {
    ErrorDialogMessages,
    InventoryManagementApiService,
    InventoryManagementItem,
    InventoryMangagementItemExtended,
    NeededAllocationTourInventoryFilters,
    NeededAllocationTourInventoryReminderItem,
    NeededAllocationUserPreference,
    UIStatus,
    UIState,
    UserState,
} from '@app/core';
import {
    BehaviorSubject,
    Observable,
    catchError,
    distinctUntilChanged,
    filter,
    from,
    lastValueFrom,
    map,
    of,
    switchMap,
    tap,
} from 'rxjs';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';

const DefaultFilter: NeededAllocationTourInventoryFilters = {
    companyId: '',
    tourIDs: [],
    startDate: formatDate(new Date(), 'YYYY-MM-dd', 'en-US'),
    endDate: formatDate(
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        'YYYY-MM-dd',
        'en-US'
    ),
    portId: 0,
    isUsePercentage: true,
    usePercentage: 80,
    isUseSeats: false,
    useSeats: 0,
};
@Injectable()
export class AllocationState {
    userActionsState = inject(UserActionsState);
    userState = inject(UserState);
    inventoryManagementApiService = inject(InventoryManagementApiService);

    router = inject(Router);
    uiState = inject(UIState);

    needingAllocationData$ = new BehaviorSubject<{
        inventories: InventoryManagementItem[];
        reminders: NeededAllocationTourInventoryReminderItem[];
    }>({
        inventories: [],
        reminders: [],
    });

    inventoryMangagementItemExtended$: Observable<
        InventoryMangagementItemExtended[]
    > = this.needingAllocationData$.pipe(
        map((allocationData) => {
            const remindersMap = allocationData.reminders.reduce<
                Record<
                    string,
                    {
                        isIgnored: boolean;
                        isRemindLater: boolean;
                        reminderBeginDate: string;
                    }
                >
            >((acc, curr) => {
                const [fullDate] = curr.tourDate.split('T');
                const [year, month, date] = fullDate.split('-');
                acc[`${curr.tourId}-${curr.shipId}-${year}-${month}-${date}`] =
                    {
                        isIgnored: curr.isIgnored,
                        isRemindLater: curr.isRemindLater,
                        reminderBeginDate: curr.reminderBeginDate,
                    };
                return acc;
            }, {});
            return allocationData.inventories.map((inventory) => {
                // if we have a valid id that we can use to match the reminders and the inventories,
                // we shoud refactor this as this is very brittle code
                const [month, date, year] =
                    inventory.tourInventoryDateString.split('/');
                const reminderId = `${inventory.tourID}-${
                    inventory.shipId === null ? -1 : inventory.shipId
                }-${year}-${month}-${date}`;
                if (remindersMap[reminderId]) {
                    return {
                        ...inventory,
                        ...remindersMap[reminderId],
                    };
                }
                return inventory;
            });
        })
    );

    needingAllocationStatus$ = new BehaviorSubject<{
        inventories: UIStatus;
        reminders: UIStatus;
        userPreference: UIStatus;
    }>({
        inventories: 'idle',
        reminders: 'idle',
        userPreference: 'idle',
    });

    needingAllocationConfig$ = new BehaviorSubject<{
        refreshTriggered: {
            inventories: number;
            reminders: number;
        };
        filter: NeededAllocationTourInventoryFilters | null;
    }>({
        refreshTriggered: {
            inventories: 0,
            reminders: 0,
        },
        filter: null,
    });

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.initNeedingAllocationInventories();
    }

    resetFilters(): void {
        this.updateNeedingAllocationConfig(DefaultFilter);
    }

    private initNeedingAllocationInventories(): void {
        this.userState.aspNetUser$
            .pipe(
                filter((user) => !!user),
                distinctUntilChanged(),
                switchMap(() => {
                    return from(this.getNeededAllocationUserPreference());
                }),
                switchMap(() => {
                    return this.needingAllocationConfig$.pipe(
                        distinctUntilChanged((prev, curr) => {
                            return (
                                prev.refreshTriggered.inventories ===
                                    curr.refreshTriggered.inventories &&
                                JSON.stringify(prev.filter) ===
                                    JSON.stringify(curr.filter)
                            );
                        }),
                        map(
                            (needingAllocationConfig) =>
                                needingAllocationConfig.filter
                        ),
                        filter((filter) => !!filter),
                        map(
                            (filter) =>
                                filter as NeededAllocationTourInventoryFilters
                        ),
                        switchMap((config) => {
                            return from(
                                this.getNeededAllocationTourInventoryList(
                                    config
                                )
                            );
                        })
                    );
                })
            )
            .subscribe();

        this.userState.aspNetUser$
            .pipe(
                filter((user) => !!user),
                distinctUntilChanged(),
                switchMap(() => {
                    return this.needingAllocationConfig$.pipe(
                        map((config) => config.refreshTriggered),
                        distinctUntilChanged(),
                        switchMap(() => {
                            return from(
                                this.getNeededAllocationUserRemindersList()
                            );
                        })
                    );
                })
            )
            .subscribe();
    }

    updateNeedingAllocationConfig(
        filter: NeededAllocationTourInventoryFilters
    ): void {
        this.needingAllocationConfig$.next({
            ...this.needingAllocationConfig$.getValue(),
            filter,
        });
    }

    searchNeedingAllocations(
        filters: NeededAllocationTourInventoryFilters | null
    ): void {
        if (!filters || Object.keys(filters).length === 0) {
            this.router.navigate([
                `/operator/inventory-management/needing-allocation/`,
            ]);
        } else {
            const base64Filter = btoa(JSON.stringify(filters));
            const currentFilters = btoa(
                JSON.stringify(this.needingAllocationConfig$.getValue().filter)
            );
            if (base64Filter === currentFilters) {
                this.refreshInventories();
            } else {
                this.router.navigate(
                    [`/operator/inventory-management/needing-allocation`],
                    { queryParams: { filters: base64Filter } }
                );
            }
        }
    }

    setReminder(
        reminderItem: NeededAllocationTourInventoryReminderItem
    ): Promise<boolean> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return Promise.reject('missing companyUniqueId');
            }
            return lastValueFrom(
                this.inventoryManagementApiService
                    .saveNeededAllocationTourInventoryReminder({
                        ...reminderItem,
                        companyId: user.companyUniqueID,
                    })
                    .pipe(map((res) => res?.success))
            );
        });
    }

    getNeededAllocationTourInventoryList(
        config: NeededAllocationTourInventoryFilters
    ): Promise<InventoryManagementItem[]> {
        this.needingAllocationStatus$.next({
            ...this.needingAllocationStatus$.getValue(),
            inventories: 'loading',
        });
        this.needingAllocationData$.next({
            ...this.needingAllocationData$.getValue(),
            inventories: [],
        });
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return Promise.reject('missing companyUniqueId');
            }
            return lastValueFrom(
                this.inventoryManagementApiService
                    .getNeededAllocationTourInventoryList({
                        ...config,
                        companyId: user.companyUniqueID,
                    })
                    .pipe(
                        map((res) => res?.data || []),
                        tap((data) => {
                            this.needingAllocationStatus$.next({
                                ...this.needingAllocationStatus$.getValue(),
                                inventories: 'success',
                            });
                            this.needingAllocationData$.next({
                                ...this.needingAllocationData$.getValue(),
                                inventories: data,
                            });
                        }),
                        catchError((err) => {
                            this.uiState.openErrorDialog({
                                title: err.errorTitle
                                    ? err.errorTitle
                                    : ErrorDialogMessages.inventoryManagement
                                          .allocationNotFound.title,
                                description: err.errors[0]
                                    ? err.errors[0]
                                    : ErrorDialogMessages.inventoryManagement
                                          .allocationNotFound.description,
                                buttons: [
                                    {
                                        text: ErrorDialogMessages
                                            .inventoryManagement
                                            .allocationNotFound.buttons.close,
                                        isPrimary: true,
                                        onClick: () => {
                                            // do nothing
                                        },
                                    },
                                ],
                            });
                            this.needingAllocationStatus$.next({
                                ...this.needingAllocationStatus$.getValue(),
                                inventories: 'error',
                            });
                            return of(err);
                        })
                    )
            );
        });
    }

    getNeededAllocationUserRemindersList(): Promise<
        NeededAllocationTourInventoryReminderItem[]
    > {
        this.needingAllocationStatus$.next({
            ...this.needingAllocationStatus$.getValue(),
            reminders: 'loading',
        });
        this.needingAllocationData$.next({
            ...this.needingAllocationData$.getValue(),
            reminders: [],
        });
        return lastValueFrom(
            this.inventoryManagementApiService
                .getNeededAllocationTourInventoryReminderList()
                .pipe(
                    map((res) => res?.data || []),
                    tap((data) => {
                        this.needingAllocationStatus$.next({
                            ...this.needingAllocationStatus$.getValue(),
                            reminders: 'success',
                        });
                        this.needingAllocationData$.next({
                            ...this.needingAllocationData$.getValue(),
                            reminders: data,
                        });
                    }),
                    catchError((err) => {
                        this.uiState.openErrorDialog({
                            title: err.errorTitle
                                ? err.errorTitle
                                : ErrorDialogMessages.inventoryManagement
                                      .allocationNotFound.title,
                            description: err.errors[0]
                                ? err.errors[0]
                                : ErrorDialogMessages.inventoryManagement
                                      .allocationNotFound.description,
                            buttons: [
                                {
                                    text: ErrorDialogMessages
                                        .inventoryManagement.allocationNotFound
                                        .buttons.close,
                                    isPrimary: true,
                                    onClick: () => {
                                        // do nothing
                                    },
                                },
                            ],
                        });
                        this.needingAllocationStatus$.next({
                            ...this.needingAllocationStatus$.getValue(),
                            reminders: 'error',
                        });
                        return of(err);
                    })
                )
        );
    }

    getNeededAllocationUserPreference(): Promise<
        NeededAllocationUserPreference | undefined
    > {
        this.needingAllocationStatus$.next({
            ...this.needingAllocationStatus$.getValue(),
            userPreference: 'loading',
        });
        return lastValueFrom(
            this.inventoryManagementApiService
                .getNeededAllocationUserPreference()
                .pipe(map((res) => res?.data))
        )
            .then((preferences) => {
                this.needingAllocationStatus$.next({
                    ...this.needingAllocationStatus$.getValue(),
                    userPreference: 'idle',
                });
                const currentFilters =
                    this.needingAllocationConfig$.getValue().filter;
                if (
                    preferences &&
                    (!currentFilters ||
                        JSON.stringify(currentFilters) ===
                            JSON.stringify(DefaultFilter))
                ) {
                    this.searchNeedingAllocations({
                        portId: 0, // not supported in save preference at the time this is created
                        tourIDs: [], // not supported in save preference at the time this is created
                        isUsePercentage: preferences.isUsePercentage,
                        usePercentage:
                            preferences.usePercentage ||
                            DefaultFilter.usePercentage,
                        isUseSeats:
                            preferences.isUseSeats || DefaultFilter.isUseSeats,
                        useSeats: preferences.useSeats,
                        startDate: preferences.startDate
                            ? formatDate(
                                  preferences.startDate,
                                  'YYYY-MM-dd',
                                  'en-US'
                              )
                            : DefaultFilter.startDate,
                        endDate: preferences.endDate
                            ? formatDate(
                                  preferences.endDate,
                                  'YYYY-MM-dd',
                                  'en-US'
                              )
                            : formatDate(
                                  this.getEndDate(
                                      new Date(
                                          preferences.startDate ||
                                              DefaultFilter.endDate
                                      )
                                  ),
                                  'YYYY-MM-dd',
                                  'en-US'
                              ),
                    });
                }
                return preferences;
            })
            .catch((err) => {
                this.uiState.openErrorDialog({
                    title: err.errorTitle
                        ? err.errorTitle
                        : ErrorDialogMessages.inventoryManagement
                              .allocationNotFound.title,
                    description: err.errors[0]
                        ? err.errors[0]
                        : ErrorDialogMessages.inventoryManagement
                              .allocationNotFound.description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.inventoryManagement
                                .allocationNotFound.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                this.needingAllocationStatus$.next({
                    ...this.needingAllocationStatus$.getValue(),
                    userPreference: 'idle',
                });
                // swallow error to prevent the UI from stalling when
                // unable to load user preference
                return undefined;
            });
    }

    private getEndDate(startDate?: Date): Date {
        if (startDate) {
            return new Date(startDate.setFullYear(startDate.getFullYear() + 1));
        }
        return new Date(DefaultFilter.endDate);
    }

    saveNeededAllocationUserPreference(
        userPreference: Omit<NeededAllocationUserPreference, 'companyId'>
    ): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                // cannot save since no companyId exist for the user
                return Promise.resolve();
            }
            return lastValueFrom(
                this.inventoryManagementApiService.saveUserPreferenceInventoryManagement(
                    {
                        ...userPreference,
                        companyId: user.companyUniqueID,
                    }
                )
            ).then(() => {
                return Promise.resolve();
            });
        });
    }

    refreshInventories(): void {
        this.needingAllocationConfig$.next({
            ...this.needingAllocationConfig$.getValue(),
            refreshTriggered: {
                ...this.needingAllocationConfig$.getValue().refreshTriggered,
                inventories: new Date().getTime(),
            },
        });
    }
    refreshReminders(): void {
        this.needingAllocationConfig$.next({
            ...this.needingAllocationConfig$.getValue(),
            refreshTriggered: {
                ...this.needingAllocationConfig$.getValue().refreshTriggered,
                reminders: new Date().getTime(),
            },
        });
    }

    refresh(): void {
        this.refreshInventories();
        this.refreshReminders();
    }
}
