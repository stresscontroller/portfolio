import { Injectable, inject } from '@angular/core';
import {
    UserState,
    UserTrainingApiService,
    UserTrainingDataItem,
    TrainingListItem,
    UserTrainingConfig,
    UIStatus,
} from '@app/core';
import {
    BehaviorSubject,
    distinctUntilChanged,
    lastValueFrom,
    of,
    switchMap,
    tap,
} from 'rxjs';
import { UIState } from './ui.state';

@Injectable()
export class UserTrainingState {
    userState = inject(UserState);
    uiState = inject(UIState);
    userTrainingApiService = inject(UserTrainingApiService);

    userTrainingData$ = new BehaviorSubject<UserTrainingDataItem[]>([]);
    trainingOptions$ = new BehaviorSubject<TrainingListItem[]>([]);

    status$ = new BehaviorSubject<{
        loadTrainingList: UIStatus;
        loadTrainingData: UIStatus;
        save: UIStatus;
        delete: UIStatus;
    }>({
        loadTrainingList: 'idle',
        loadTrainingData: 'idle',
        save: 'idle',
        delete: 'idle',
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
                        this.loadTrainingOptions();
                        return this.refreshTriggered$.pipe(
                            tap(() => {
                                this.loadUserTrainingData();
                            })
                        );
                    } else {
                        this.userTrainingData$.next([]);
                        this.trainingOptions$.next([]);
                        return of([]);
                    }
                })
            )
            .subscribe();
    }

    loadTrainingOptions(): void {
        this.trainingOptions$.next([]);
        this.status$.next({
            ...this.status$.getValue(),
            loadTrainingList: 'loading',
        });
        this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.companyUniqueID) {
                    return Promise.reject('missing user information');
                }
                return lastValueFrom(
                    this.userTrainingApiService.loadTrainingList(
                        user.companyUniqueID
                    )
                );
            })
            .then((res) => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadTrainingList: 'success',
                });
                this.trainingOptions$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadTrainingList: 'error',
                });
            });
    }

    loadUserTrainingData(): void {
        this.userTrainingData$.next([]);
        this.status$.next({
            ...this.status$.getValue(),
            loadTrainingData: 'loading',
        });

        this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.companyUniqueID || !user.id) {
                    return Promise.reject('missing user information');
                }
                return lastValueFrom(
                    this.userTrainingApiService.loadUserTrainingData(
                        user.companyUniqueID,
                        user.id
                    )
                );
            })
            .then((res) => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadTrainingData: 'success',
                });
                this.userTrainingData$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadTrainingData: 'error',
                });
            });
    }

    saveTraining(config: UserTrainingConfig): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            save: 'loading',
        });
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user || !user.id || !user.companyUniqueID) {
                    return Promise.reject('missing user information');
                }
                return lastValueFrom(
                    this.userTrainingApiService.saveUserTraining({
                        ...config,
                        userId: user.id,
                        companyUniqueId: user.companyUniqueID,
                    })
                );
            })
            .then((res) => {
                if (res.success) {
                    this.status$.next({
                        ...this.status$.getValue(),
                        save: 'idle',
                    });
                    return Promise.resolve();
                } else {
                    return Promise.reject(res.error);
                }
            })
            .catch((error) => {
                this.status$.next({
                    ...this.status$.getValue(),
                    save: 'error',
                });
                return Promise.reject(error);
            });
    }

    deleteUserTraining(trainingUserId: number): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            delete: 'loading',
        });
        return lastValueFrom(
            this.userTrainingApiService.deleteUserTraining(trainingUserId)
        )
            .then((res) => {
                if (res.success) {
                    this.uiState.closeRemoveTrainingModal();
                    this.status$.next({
                        ...this.status$.getValue(),
                        delete: 'idle',
                    });
                    return Promise.resolve();
                } else {
                    return Promise.reject(res.error);
                }
            })
            .catch((error) => {
                this.status$.next({
                    ...this.status$.getValue(),
                    delete: 'error',
                });
                return Promise.reject(error);
            });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }
}
