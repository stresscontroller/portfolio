import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfirmationDialogMessages } from '../constants';

interface ConfirmationDialogContext {
    title: string;
    description: string;
    buttons: { text: string; isPrimary?: boolean; onClick: () => void }[];
}

interface SuccessDialogContext {
    title: string;
    description: string;
    buttons: { text: string; isPrimary?: boolean; onClick: () => void }[];
}

interface ErrorDialogContext {
    title: string;
    description: string;
    buttons: { text: string; isPrimary?: boolean; onClick: () => void }[];
}

@Injectable({
    providedIn: 'root',
})
export class UIState {
    loadingIndicator$ = new BehaviorSubject<boolean>(false);
    modals$ = new BehaviorSubject<{
        lightbox: {
            isOpen: boolean;
            context?: {
                image: string;
            };
        };
    }>({
        lightbox: {
            isOpen: false,
        },
    });
    dialogs$ = new BehaviorSubject<{
        confirmation: {
            isOpen: boolean;
            context?: ConfirmationDialogContext;
        };
        success: {
            isOpen: boolean;
            context?: SuccessDialogContext;
        };
        error: {
            isOpen: boolean;
            context?: ErrorDialogContext;
        };
    }>({
        confirmation: {
            isOpen: false,
        },
        success: {
            isOpen: false,
        },
        error: {
            isOpen: false,
        },
    });

    showLoadingIndicator(): void {
        this.loadingIndicator$.next(true);
    }

    hideLoadingIndicator(): void {
        this.loadingIndicator$.next(false);
    }

    openConfirmationDialog(context: ConfirmationDialogContext): void {
        if (this.dialogs$.getValue().confirmation.isOpen === false) {
            this.dialogs$.next({
                ...this.dialogs$.getValue(),
                confirmation: {
                    isOpen: true,
                    context: context,
                },
            });
        }
    }

    closeConfirmationDialog(): void {
        this.dialogs$.next({
            ...this.dialogs$.getValue(),
            confirmation: {
                isOpen: false,
            },
        });
    }

    openSuccessDialog(context: SuccessDialogContext): void {
        if (this.dialogs$.getValue().success.isOpen === false) {
            this.dialogs$.next({
                ...this.dialogs$.getValue(),
                success: {
                    isOpen: true,
                    context: context,
                },
            });
        }
    }

    closeSuccessDialog(): void {
        this.dialogs$.next({
            ...this.dialogs$.getValue(),
            success: {
                isOpen: false,
            },
        });
    }

    openErrorDialog(context: ErrorDialogContext): void {
        if (this.dialogs$.getValue().error.isOpen === false) {
            this.dialogs$.next({
                ...this.dialogs$.getValue(),
                error: {
                    isOpen: true,
                    context: context,
                },
            });
        }
    }

    closeErrorDialog(): void {
        this.dialogs$.next({
            ...this.dialogs$.getValue(),
            error: {
                isOpen: false,
            },
        });
    }

    openLightbox(context: { image: string }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            lightbox: {
                isOpen: true,
                context,
            },
        });
    }

    closeLightbox(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            lightbox: {
                isOpen: false,
            },
        });
    }

    openUnsavedChangesConfirmationDialog(): Promise<boolean> {
        return new Promise((resolve) => {
            this.openConfirmationDialog({
                title: ConfirmationDialogMessages.general.unsavedChanges.title,
                description:
                    ConfirmationDialogMessages.general.unsavedChanges
                        .description,
                buttons: [
                    {
                        text: ConfirmationDialogMessages.general.unsavedChanges
                            .buttons.cancel,
                        isPrimary: true,
                        onClick: () => {
                            resolve(false);
                        },
                    },
                    {
                        text: ConfirmationDialogMessages.general.unsavedChanges
                            .buttons.leave,
                        onClick: () => {
                            resolve(true);
                        },
                    },
                ],
            });
        });
    }
}
