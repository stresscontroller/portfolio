import { Injectable, inject } from '@angular/core';
import {
    InventoryManagementApiService,
    RecentlyReleasedInventory,
    UserState,
    UIState,
    ErrorDialogMessages,
} from '@app/core';
import {
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    from,
    lastValueFrom,
    map,
    switchMap,
} from 'rxjs';

@Injectable()
export class InventoryManagementState {
    userState = inject(UserState);
    uiState = inject(UIState);
    inventoryManagementApiService = inject(InventoryManagementApiService);

    status$ = new BehaviorSubject<{
        loadInventories: 'idle' | 'loading' | 'success' | 'error';
    }>({
        loadInventories: 'idle',
    });

    recentlyReleasedInventories$ = new BehaviorSubject<
        RecentlyReleasedInventory[]
    >([]);

    config$ = new BehaviorSubject<{
        refreshTriggered: number;
    }>({
        refreshTriggered: 0,
    });

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.initRecentlyReleasedInventories();
    }

    private initRecentlyReleasedInventories(): void {
        this.userState.aspNetUser$
            .pipe(
                filter((user) => !!user),
                distinctUntilChanged(),
                switchMap(() => {
                    return this.config$.pipe(
                        map((config) => config.refreshTriggered),
                        distinctUntilChanged(),
                        switchMap(() => {
                            return from(
                                this.loadRecentlyReleasedInventoryies()
                            );
                        })
                    );
                })
            )
            .subscribe();
    }

    private loadRecentlyReleasedInventoryies(): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            loadInventories: 'loading',
        });
        this.recentlyReleasedInventories$.next([]);
        return lastValueFrom(
            this.inventoryManagementApiService.getRecentlyReleasedInventoryList()
        )
            .then((res) => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadInventories: 'success',
                });
                this.recentlyReleasedInventories$.next(res.data);
            })
            .catch((data) => {
                this.uiState.openErrorDialog({
                    title: data.errorTitle
                        ? data.errorTitle
                        : ErrorDialogMessages.inventoryManagement
                              .recentlyReleasedLoadError.title,
                    description: data.errors[0]
                        ? data.errors[0]
                        : ErrorDialogMessages.inventoryManagement
                              .recentlyReleasedLoadError.description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.inventoryManagement
                                .recentlyReleasedLoadError.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                this.status$.next({
                    ...this.status$.getValue(),
                    loadInventories: 'error',
                });
            });
    }

    refresh(): void {
        this.config$.next({
            ...this.config$.getValue(),
            refreshTriggered: new Date().getTime(),
        });
    }
}
