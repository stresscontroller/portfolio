import { Injectable, inject } from '@angular/core';
import {
    BehaviorSubject,
    Subscription,
    combineLatest,
    debounceTime,
    filter,
    lastValueFrom,
    map,
    take,
} from 'rxjs';
import {
    AgentApiService,
    FeatureFlagApiService,
    PermissionsApiService,
    UserApiService,
} from '../services';
import { debounceTimes } from '../constants';
import {
    AspNetUser,
    FormattedFeatureControls,
    formatFeatureControls,
} from '../models';
import { AuthToken } from '../configs';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class UserState {
    authService = inject(AuthToken);
    agentApiService = inject(AgentApiService);
    userApiService = inject(UserApiService);
    permissionsApiService = inject(PermissionsApiService);
    featureFlagApiService = inject(FeatureFlagApiService);
    router = inject(Router);

    controls$ = new BehaviorSubject<FormattedFeatureControls | undefined>(
        undefined
    );

    profileIsLoading$ = new BehaviorSubject<boolean>(false);
    isLoading$ = combineLatest([
        this.authService.authInProgress$,
        this.profileIsLoading$,
    ]).pipe(
        debounceTime(debounceTimes.apiDebounce), // prevent firing too often when each observable event is triggered close to each other
        map(([authIsLoading, profileIsLoading]) => {
            return authIsLoading || profileIsLoading;
        })
    );

    user$ = this.authService.user$;
    aspNetUser$ = new BehaviorSubject<AspNetUser | undefined>(undefined);

    private userSubscription: Subscription | undefined = undefined;

    listenToUserChanges(): void {
        if (this.userSubscription) {
            return;
        }
        this.userSubscription = this.user$.subscribe((user) => {
            if (user) {
                this.loadAspNetUser().then((user) => {
                    const roleId = user?.roleId;
                    const companyUniqueId = user?.companyUniqueID;
                    if (roleId && companyUniqueId) {
                        this.loadUserPermissions(roleId, companyUniqueId);
                        this.listenToRouteChange(roleId, companyUniqueId);
                    }
                });
            } else {
                this.aspNetUser$.next(undefined);
            }
        });
    }

    private routerSubscription: Subscription | undefined = undefined;
    listenToRouteChange(roleId: string, companyUniqueId: string): void {
        if (this.routerSubscription) {
            this.routerSubscription.unsubscribe();
            this.routerSubscription = undefined;
        }
        this.routerSubscription = this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                debounceTime(5000) // add a 5 second debounce to prevent triggering the API too often
            )
            .subscribe(() => {
                this.loadUserPermissions(roleId, companyUniqueId);
            });
    }

    loadUserPermissions(roleId: string, companyUniqueId: string): void {
        Promise.all([
            lastValueFrom(
                this.featureFlagApiService
                    .getGlobalFeatureOverview()
                    .pipe(map((res) => res.data))
            ),
            lastValueFrom(
                this.permissionsApiService.getCruiseCodeFeatureByRole(
                    companyUniqueId,
                    roleId
                )
            ),
        ]).then(([globalFlags, roleBasedFlags]) => {
            const res = formatFeatureControls(globalFlags, roleBasedFlags);
            this.controls$.next(res);
        });
    }

    getAspNetUser(): Promise<AspNetUser | undefined> {
        if (this.aspNetUser$.getValue()) {
            return Promise.resolve(this.aspNetUser$.getValue());
        } else {
            if (this.isLoadingAspNetUser) {
                return lastValueFrom(
                    this.aspNetUser$.pipe(
                        filter((user) => !!user),
                        take(1)
                    )
                );
            }
            return this.loadAspNetUser().then(() => {
                return Promise.resolve(this.aspNetUser$.getValue());
            });
        }
    }

    private isLoadingAspNetUser = false;
    loadAspNetUser(): Promise<AspNetUser | undefined> {
        this.isLoadingAspNetUser = true;
        return lastValueFrom(
            this.userApiService.getAspNetUser().pipe(map((res) => res.data))
        )
            .then((user) => {
                this.aspNetUser$.next(user);
                this.isLoadingAspNetUser = false;

                return Promise.resolve(user);
            })
            .catch(() => {
                this.isLoadingAspNetUser = false;

                this.aspNetUser$.next(undefined);
                return Promise.resolve(undefined);
            });
    }
}
