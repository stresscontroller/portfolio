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
import { UserEditState } from '../../../state';

@Injectable()
export class UserNotesState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);
    uiState = inject(UIState);
    userEditState = inject(UserEditState);
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
        this.userEditState.editUserId$
            .pipe(
                distinctUntilChanged(),
                switchMap((editUserId) => {
                    if (editUserId) {
                        return this.refreshTriggered$.pipe(
                            switchMap(() => {
                                return from(this.loadUserNotes(editUserId));
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
        const editUserId = this.userEditState.editUserId$.getValue();
        if (!editUserId) {
            return Promise.reject('no edit user id');
        }
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.b2CUserId || !user.companyUniqueID) {
                    return Promise.reject('user is undefined');
                }
                return lastValueFrom(
                    this.userManagementApiService.saveUserNotes({
                        userId: editUserId,
                        notes: userNotes,
                        companyId: user.companyUniqueID,
                        createdBy: user.b2CUserId,
                    })
                );
            })
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
    }

    editUserNote(config: UserNoteConfig): Promise<void> {
        const editUserId = this.userEditState.editUserId$.getValue();
        if (!editUserId) {
            return Promise.reject('no edit user id');
        }
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.b2CUserId || !user.companyUniqueID) {
                    return Promise.reject('user is undefined');
                }
                return lastValueFrom(
                    this.userManagementApiService.saveUserNotes({
                        userId: editUserId,
                        userNoteId: config.userNoteId,
                        notes: config.notes,
                        companyId: user.companyUniqueID,
                        createdBy: user.b2CUserId,
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
