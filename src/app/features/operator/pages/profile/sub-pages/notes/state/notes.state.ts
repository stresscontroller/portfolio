import { Injectable, inject } from '@angular/core';
import {
    UserState,
    UserManagementApiService,
    UserNotesListItem,
    UserNoteConfig,
    UIStatus,
} from '@app/core';
import {
    BehaviorSubject,
    distinctUntilChanged,
    from,
    lastValueFrom,
    of,
    switchMap,
} from 'rxjs';
import { UIState } from './ui.state';

@Injectable()
export class UserNotesState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);
    uiState = inject(UIState);
    notes$ = new BehaviorSubject<UserNotesListItem[]>([]);
    status$ = new BehaviorSubject<{
        load: UIStatus;
        save: UIStatus;
    }>({
        load: 'idle',
        save: 'idle',
    });
    private refreshTriggered$ = new BehaviorSubject<number>(0);

    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.userState.aspNetUser$
            .pipe(
                distinctUntilChanged(),
                switchMap((user) => {
                    const userId = user?.id;
                    if (userId) {
                        return this.refreshTriggered$.pipe(
                            switchMap(() => {
                                return from(this.loadUserNotes(userId));
                            })
                        );
                    } else {
                        this.notes$.next([]);
                        return of([]);
                    }
                })
            )
            .subscribe();
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    loadUserNotes(userId: string): Promise<void> {
        this.notes$.next([]);
        this.status$.next({
            ...this.status$.getValue(),
            load: 'loading',
        });
        return lastValueFrom(
            this.userManagementApiService.getUserNotesList(userId)
        )
            .then((res) => {
                this.status$.next({
                    ...this.status$.getValue(),
                    load: 'success',
                });
                this.notes$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    load: 'error',
                });
            });
    }

    saveUserNotes(userNotes: string): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            save: 'loading',
        });
        return this.userState.getAspNetUser().then((user) => {
            if (!user || !user.id || !user.companyUniqueID) {
                return Promise.reject('user is undefined');
            }
            return lastValueFrom(
                this.userManagementApiService.saveUserNotes({
                    userId: user.id,
                    notes: userNotes,
                    companyId: user.companyUniqueID,
                    createdBy: user.id,
                })
            )
                .then(() => {
                    this.refresh();
                    this.status$.next({
                        ...this.status$.getValue(),
                        save: 'success',
                    });
                    return Promise.resolve();
                })
                .catch((err) => {
                    this.status$.next({
                        ...this.status$.getValue(),
                        save: 'error',
                    });
                    return Promise.reject(err);
                });
        });
    }

    editUserNote(config: UserNoteConfig): Promise<void> {
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.id || !user.companyUniqueID) {
                    return Promise.reject('user is undefined');
                }
                return lastValueFrom(
                    this.userManagementApiService.saveUserNotes({
                        userId: user.id,
                        userNoteId: config.userNoteId,
                        notes: config.notes,
                        companyId: user.companyUniqueID,
                        createdBy: user.id,
                    })
                );
            })
            .then(() => {
                this.refresh();
                return Promise.resolve();
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }
    deleteUserNotes(userNoteId: number): Promise<void> {
        return lastValueFrom(
            this.userManagementApiService.deleteUserNote(userNoteId)
        ).then(() => {
            this.uiState.closeDeleteNotesModal();
            this.refresh();
            return Promise.resolve();
        });
    }
}
