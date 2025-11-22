import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    Subscription,
    distinctUntilChanged,
    filter,
    map,
} from 'rxjs';

export enum DTDCommands {
    UpdateFinalBooking = 'UpdateFinalBooking',
    UpdateDockOrDriver = 'UpdateDockOrDriver',
}

enum DtdUserActionStatus {
    Pending = 'Pending',
    Current = 'Current',
    Failed = 'Failed',
}

// don't pass in functions here because we're going to stringify and save this to
// the device, functions won't work that way
interface DtdUserAction {
    command: DTDCommands;
    parameters: any; // TODO: type this
    status?: DtdUserActionStatus;
}

@Injectable({
    providedIn: 'root',
})
export class UserActionsState {
    private _userActions$ = new BehaviorSubject<Record<string, DtdUserAction>>(
        {}
    );

    // use this to list in-flight user actions
    userActions$ = this._userActions$.asObservable();

    init(): void {
        this.listenToUserActions();
    }

    addUserAction(userAction: DtdUserAction): void {
        this._userActions$.next({
            ...this._userActions$.getValue(),
            [this.generateUUID()]: {
                ...userAction,
                status: DtdUserActionStatus.Pending,
            },
        });
    }

    removeUserAction(id: string): void {
        const userActions = this._userActions$.getValue();
        if (id in userActions) {
            delete userActions[id];
            this._userActions$.next({
                ...userActions,
            });
        }
    }

    setUserActionStatus(id: string, status: DtdUserActionStatus): void {
        const userActions = this._userActions$.getValue();
        if (id in userActions) {
            this._userActions$.next({
                ...userActions,
                [id]: {
                    ...userActions[id],
                    status: status,
                },
            });
        }
    }

    executeUserAction(userAction: DtdUserAction): Promise<void> {
        switch (userAction.command) {
            case DTDCommands.UpdateFinalBooking: {
                return this.updateFinalBooking();
            }
            case DTDCommands.UpdateDockOrDriver: {
                return this.updateDockOrDriver();
            }
            default: {
                return Promise.resolve();
            }
        }
    }

    private userActionListener: Subscription | undefined = undefined;
    listenToUserActions(): void {
        if (this.userActionListener) {
            return;
        }
        this.userActionListener = this._userActions$
            .pipe(
                map((userActions) => {
                    if (!userActions || Object.keys(userActions).length === 0) {
                        return undefined;
                    }
                    const [firstUserActionId, firstUserActionValue] =
                        Object.entries(userActions)[0];
                    return {
                        id: firstUserActionId,
                        ...firstUserActionValue,
                    };
                }),
                distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
                // skip if there is no userAction to process
                filter((userAction) => !!userAction)
            )
            .subscribe((userAction) => {
                if (userAction) {
                    this.setUserActionStatus(
                        userAction.id,
                        DtdUserActionStatus.Current
                    );
                    this.executeUserAction(userAction)
                        .then(() => {
                            this.removeUserAction(userAction.id);
                        })
                        .catch((err) => {
                            // option to retry?
                            this.setUserActionStatus(
                                userAction.id,
                                DtdUserActionStatus.Failed
                            );
                        });
                }
            });
    }

    updateFinalBooking(): Promise<void> {
        // TODO make API call here
        return Promise.resolve();
    }

    updateDockOrDriver(): Promise<void> {
        // TODO make API call here
        return Promise.resolve();
    }

    private generateUUID(): string {
        // this will be unique as this is to the millisecond
        return Date.now().toString();
    }
}
