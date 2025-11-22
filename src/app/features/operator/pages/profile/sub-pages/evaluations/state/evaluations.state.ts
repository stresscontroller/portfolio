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

@Injectable()
export class UserEvaluationsState {
    userState = inject(UserState);
    uiState = inject(UIState);
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
        this.evaluations$.next([]);
        this.status$.next('loading');
        this.userState.getAspNetUser().then((user) => {
            if (!user || !user.companyUniqueID || !user.id) {
                return;
            }
            lastValueFrom(
                this.userEvaluationsApiService.loadUserEvaluations(
                    user.companyUniqueID,
                    user.id
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
        return this.userState.getAspNetUser().then((user) => {
            if (!user || !user.companyUniqueID || !user.id) {
                return Promise.reject('missing user information');
            }
            return lastValueFrom(
                this.userEvaluationsApiService.saveUserEvaluations({
                    ...config,
                    userId: user.id,
                    companyId: user.companyUniqueID,
                })
            ).then((res) => {
                if (!res.success) {
                    return Promise.reject(res.error);
                }
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
