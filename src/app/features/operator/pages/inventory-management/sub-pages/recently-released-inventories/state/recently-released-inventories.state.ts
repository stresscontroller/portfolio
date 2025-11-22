import { Injectable, inject } from '@angular/core';
import { UserActionsState } from '../../../../tour-dispatch/state';
import {
    ErrorDialogMessages,
    InventoryManagementApiService,
    SuccessDialogMessages,
    UIState,
    UserState,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { InventoryManagementState } from '../../state';

@Injectable()
export class RecentlyReleasedInventoriesState {
    userActionsState = inject(UserActionsState);
    userState = inject(UserState);
    uiState = inject(UIState);
    inventoryManagementApiService = inject(InventoryManagementApiService);
    inventoryManagementState = inject(InventoryManagementState);
    status$ = new BehaviorSubject<{
        sendEmail: 'idle' | 'loading' | 'success' | 'error';
        deleteInventory: 'idle' | 'loading' | 'success' | 'error';
    }>({
        sendEmail: 'idle',
        deleteInventory: 'idle',
    });

    sendEmailToReleasedInventories(inventoryIds: number[]): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            sendEmail: 'loading',
        });
        return lastValueFrom(
            this.inventoryManagementApiService.sendEmailToReleasedInventories(
                inventoryIds
            )
        )
            .then((res) => {
                if (!res.success) {
                    throw res.errors;
                }
                this.status$.next({
                    ...this.status$.getValue(),
                    sendEmail: 'success',
                });
                this.uiState.openSuccessDialog({
                    title: SuccessDialogMessages.inventoryManagement
                        .recentlyReleasedSendEmailError.title,
                    description:
                        SuccessDialogMessages.inventoryManagement
                            .recentlyReleasedSendEmailError.description,
                    buttons: [
                        {
                            text: SuccessDialogMessages.inventoryManagement
                                .recentlyReleasedSendEmailError.buttons.close,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                this.inventoryManagementState.refresh();
                return Promise.resolve();
            })
            .catch(() => {
                this.uiState.openErrorDialog({
                    title: ErrorDialogMessages.inventoryManagement
                        .recentlyReleasedSendEmailError.title,
                    description:
                        ErrorDialogMessages.inventoryManagement
                            .recentlyReleasedSendEmailError.description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.inventoryManagement
                                .recentlyReleasedSendEmailError.buttons.close,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                this.status$.next({
                    ...this.status$.getValue(),
                    sendEmail: 'error',
                });
                return Promise.reject();
            });
    }

    deleteRecentlyReleasedInventoryList(inventoryIds: number[]): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            deleteInventory: 'loading',
        });
        return lastValueFrom(
            this.inventoryManagementApiService.deleteRecentlyReleasedInventoryList(
                inventoryIds
            )
        )
            .then((res) => {
                if (!res.success) {
                    throw res.errors;
                }
                this.status$.next({
                    ...this.status$.getValue(),
                    deleteInventory: 'success',
                });
                this.uiState.openSuccessDialog({
                    title: SuccessDialogMessages.inventoryManagement
                        .recentlyReleasedDismissError.title,
                    description:
                        SuccessDialogMessages.inventoryManagement
                            .recentlyReleasedDismissError.description,
                    buttons: [
                        {
                            text: SuccessDialogMessages.inventoryManagement
                                .recentlyReleasedDismissError.buttons.close,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                this.inventoryManagementState.refresh();
                return Promise.resolve();
            })
            .catch(() => {
                this.uiState.openErrorDialog({
                    title: ErrorDialogMessages.inventoryManagement
                        .recentlyReleasedDismissError.title,
                    description:
                        ErrorDialogMessages.inventoryManagement
                            .recentlyReleasedDismissError.description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.inventoryManagement
                                .recentlyReleasedDismissError.buttons.close,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                this.status$.next({
                    ...this.status$.getValue(),
                    deleteInventory: 'error',
                });
                return Promise.reject();
            });
    }
}
