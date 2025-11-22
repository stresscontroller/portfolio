import { Injectable, inject } from '@angular/core';
import { UserDetails, UserManagementApiService, UserState } from '@app/core';
import { BehaviorSubject, filter, map, switchMap, tap } from 'rxjs';

@Injectable()
export class UserEditState {
    userState = inject(UserState);
    userManagementApiService = inject(UserManagementApiService);

    editUserId$ = new BehaviorSubject<string | undefined>(undefined);
    userDetails$ = new BehaviorSubject<UserDetails | undefined>(undefined);
    isLoadingUserDetails$ = new BehaviorSubject<boolean>(false);

    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;
    init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.editUserId$
            .pipe(
                tap(() => {
                    this.userDetails$.next(undefined);
                }),
                filter((userId) => !!userId),
                switchMap((userId) =>
                    this.refreshTriggered$.pipe(
                        switchMap(() => {
                            this.isLoadingUserDetails$.next(true);
                            return this.userManagementApiService
                                .getUserDetail(userId!)
                                .pipe(map((res) => res?.data));
                        })
                    )
                )
            )
            .subscribe((user) => {
                this.isLoadingUserDetails$.next(false);
                this.userDetails$.next(user);
            });
    }

    setEditUserId(userId: string): void {
        this.editUserId$.next(userId);
    }

    clearEditUserId(): void {
        this.editUserId$.next(undefined);
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }
}
