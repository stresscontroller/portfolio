import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, of, switchMap } from 'rxjs';
import { AuthToken, UserState } from '@app/core';

export const featureGuardCanActivate: CanActivateFn = (route, state) => {
    // route should contain feature and page
    const authService = inject(AuthToken);
    const userState = inject(UserState);
    const router = inject(Router);

    return authService.authInProgress$.pipe(
        filter((isInProgress) => !isInProgress),
        switchMap(() => authService.user$),
        switchMap((user) => {
            if (!user) {
                router.navigate(['/sign-in-redirect']);
                return of(false);
            }
            return userState.controls$.pipe(
                filter((control) => !!control),
                map((featureControl) => {
                    const targetFeature = route.data['feature'] as string;
                    const targetFeaturePage = route.data['pages'] as string[];
                    if (featureControl && targetFeature in featureControl) {
                        const featureDetail = featureControl[targetFeature];
                        if (
                            featureDetail.isActive === true &&
                            targetFeaturePage
                        ) {
                            const activePages = Object.keys(featureDetail.pages)
                                .reduce<boolean[]>((acc, k) => {
                                    if (targetFeaturePage.indexOf(k) >= 0) {
                                        acc.push(
                                            featureDetail.pages[k].isActive
                                        );
                                    }
                                    return acc;
                                }, [])
                                .filter(
                                    (pageIsActive) => pageIsActive === true
                                ).length;
                            if (activePages > 0) {
                                return true;
                            }
                        } else if (
                            featureDetail.isActive === true &&
                            !targetFeaturePage
                        ) {
                            return true;
                        }
                    }
                    // this will fallback to the closest page or feature if the current one is not available
                    const targetFeatureDetails =
                        featureControl?.[targetFeature];
                    const pagesInFeature = targetFeatureDetails?.pages;
                    if (
                        targetFeatureDetails?.isActive &&
                        targetFeatureDetails?.route
                    ) {
                        if (pagesInFeature) {
                            const activePage = Object.values(
                                pagesInFeature
                            ).find((p) => p.isActive === true && p.route);
                            if (activePage) {
                                router.navigate([
                                    `${state.url.substring(
                                        0,
                                        state.url.lastIndexOf('/')
                                    )}/${activePage.route}`,
                                ]);
                                return false;
                            }
                        }
                    }
                    if (featureControl) {
                        const fallbackRoute = Object.values(
                            featureControl
                        ).find(
                            (f) =>
                                f.isActive === true &&
                                f.route &&
                                Object.values(f.pages).findIndex(
                                    (p) => p.isActive
                                ) >= 0
                        )?.route;
                        if (fallbackRoute) {
                            router.navigate([`/operator/${fallbackRoute}`]);
                            return false;
                        }
                    }

                    // redirect to 403 route
                    router.navigate(['/forbidden']);
                    return false;
                })
            );
        })
    );
};
