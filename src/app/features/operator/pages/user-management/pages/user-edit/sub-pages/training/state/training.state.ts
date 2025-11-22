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
    from,
    lastValueFrom,
    of,
    startWith,
    switchMap,
    tap,
} from 'rxjs';
import { UIState } from './ui.state';
import { UserEditState } from '../../../state';

@Injectable()
export class UserTrainingState {
    userState = inject(UserState);
    uiState = inject(UIState);
    userEditState = inject(UserEditState);
    userTrainingApiService = inject(UserTrainingApiService);
    userTrainingData$ = new BehaviorSubject<UserTrainingDataItem[]>([]);
    trainingList$ = new BehaviorSubject<TrainingListItem[]>([]);
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
    private refresh$ = new BehaviorSubject<number>(0);

    private initialized = false;
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.userState.getAspNetUser().then((user) => {
            const companyId = user?.companyUniqueID ?? '';
            this.loadTrainingList(companyId);
            this.userEditState.editUserId$
                .pipe(
                    distinctUntilChanged(),
                    switchMap((editUserId) => {
                        if (editUserId) {
                            return this.refresh$.pipe(
                                startWith(true),
                                switchMap(() => {
                                    return from(
                                        this.loadUserTrainingData(
                                            companyId,
                                            editUserId
                                        )
                                    );
                                })
                            );
                        } else {
                            this.userTrainingData$.next([]);
                            return of([]);
                        }
                    })
                )
                .subscribe();
        });
    }

    loadTrainingList(companyID: string): Promise<void> {
        this.trainingList$.next([]);
        this.status$.next({
            ...this.status$.getValue(),
            loadTrainingList: 'loading',
        });
        return lastValueFrom(
            this.userTrainingApiService.loadTrainingList(companyID)
        )
            .then((res) => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadTrainingList: 'success',
                });
                this.trainingList$.next(res.data);
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    loadTrainingList: 'error',
                });
            });
    }

    loadUserTrainingData(companyId: string, userId: string): Promise<void> {
        this.userTrainingData$.next([]);
        this.status$.next({
            ...this.status$.getValue(),
            loadTrainingData: 'loading',
        });

        return lastValueFrom(
            this.userTrainingApiService.loadUserTrainingData(companyId, userId)
        )
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

    refresh(): void {
        this.refresh$.next(new Date().getTime());
    }

    saveTraining(config: UserTrainingConfig): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            save: 'loading',
        });
        const editUserId = this.userEditState.editUserId$.getValue();
        if (!editUserId) {
            return Promise.reject('no edit user id');
        }
        return this.userState.getAspNetUser().then((user) => {
            return lastValueFrom(
                this.userTrainingApiService.saveUserTraining({
                    ...config,
                    userId: editUserId,
                    companyUniqueId: user?.companyUniqueID ?? '',
                })
            )
                .then((res) => {
                    if (res.success) {
                        this.status$.next({
                            ...this.status$.getValue(),
                            save: 'idle',
                        });
                        this.refresh();
                        return Promise.resolve();
                    } else {
                        return Promise.reject(res.error);
                    }
                })
                .catch(() => {
                    this.status$.next({
                        ...this.status$.getValue(),
                        save: 'error',
                    });
                });
        });
    }

    deleteUserTraining(trainingUserId: number): Promise<void> {
        this.status$.next({
            ...this.status$.getValue(),
            delete: 'loading',
        });
        return lastValueFrom(
            this.userTrainingApiService.deleteUserTraining(trainingUserId).pipe(
                tap((res) => {
                    if (res.success) {
                        this.uiState.closeRemoveTrainingModal();
                        this.status$.next({
                            ...this.status$.getValue(),
                            delete: 'idle',
                        });
                        this.refresh();
                    } else {
                        throw res.error;
                    }
                })
            )
        )
            .then(() => {
                return Promise.resolve();
            })
            .catch(() => {
                this.status$.next({
                    ...this.status$.getValue(),
                    delete: 'error',
                });
            });
    }
}
