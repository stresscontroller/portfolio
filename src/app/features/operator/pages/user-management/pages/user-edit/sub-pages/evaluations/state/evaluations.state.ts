import { Injectable, inject } from '@angular/core';
import {
    UserState,
    UserEvaluationsApiService,
    UserEvaluationsListItem,
    UserEvaluationsConfig,
    UIStatus,
} from '@app/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { UIState } from './ui.state';
import { UserEditState } from '../../../state';

@Injectable()
export class UserEvaluationsState {
    userState = inject(UserState);
    uiState = inject(UIState);
    userEditState = inject(UserEditState);
    userEvaluationsApiService = inject(UserEvaluationsApiService);
    evaluations$ = new BehaviorSubject<UserEvaluationsListItem[]>([]);
    status$ = new BehaviorSubject<UIStatus>('idle');
    private refreshTriggered$ = new BehaviorSubject<number>(0);
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.refreshTriggered$.subscribe(() => {
            this.loadUserEvaluations();
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    loadUserEvaluations(): void {
        const editUserId = this.userEditState.editUserId$.getValue();
        if (!editUserId) {
            return;
        }
        this.evaluations$.next([]);
        this.status$.next('loading');
        this.userState.getAspNetUser().then((user) => {
            if (!user?.companyUniqueID) {
                return;
            }
            lastValueFrom(
                this.userEvaluationsApiService.loadUserEvaluations(
                    user.companyUniqueID,
                    editUserId
                )
            )
                .then((res) => {
                    this.evaluations$.next(res.data);
                    this.status$.next('success');
                })
                .catch(() => {
                    this.status$.next('error');
                });
        });
    }

    saveEvaluations(config: UserEvaluationsConfig): Promise<void> {
        const editUserId = this.userEditState.editUserId$.getValue();
        if (!editUserId) {
            return Promise.reject('no edit user id');
        }
        return this.userState.getAspNetUser().then((user) => {
            return lastValueFrom(
                this.userEvaluationsApiService.saveUserEvaluations({
                    ...config,
                    userId: editUserId,
                    companyId: user?.companyUniqueID ?? '',
                })
            ).then(() => {
                return Promise.resolve();
            });
        });
    }

    deleteUserEvaluation(config: UserEvaluationsListItem): Promise<void> {
        return lastValueFrom(
            this.userEvaluationsApiService.deleteUserEvaluation(config)
        ).then((res) => {
            if (!res.success) {
                return Promise.reject(res.error);
            }
            return Promise.resolve();
        });
    }
}
