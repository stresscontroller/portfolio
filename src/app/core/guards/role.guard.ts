import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { roles } from '../configs/auth.config';
import { AuthToken } from '../configs';

export const roleGuardCanActivate: CanActivateFn = (route, _state) => {
    const authService = inject(AuthToken);
    const router = inject(Router);
    return authService.authInProgress$.pipe(
        filter((isInProgress) => !isInProgress),
        switchMap(() => authService.user$),
        map((user) => {
            if (!user) {
                router.navigate(['/home']);
                return false;
            }
            const expectedRole = route.data['expectedRole'] as string[];
            const overrideRole = route.data['overrideRole'] as string[];
            const account = authService.getAccount();
            let overrideRoleMatch = false;
            let expectedRoleMatch = false;

            // Override role check here
            if (overrideRole != undefined) {
                overrideRole.forEach((role) => {
                    if (account?.idTokenClaims?.[role]) {
                        overrideRoleMatch = true;
                    } else if (role === roles.User) {
                        // workaround for missing idTokenClaims when logging in via ropcFirstTimeCheckout flow
                        overrideRoleMatch =
                            account?.idTokenClaims?.['tfp'] ===
                            'B2C_1_SignInROPCFirstTimeCheckout';
                    }
                });
            }
            if (overrideRoleMatch) {
                return true;
            }

            // Expected role check here
            if (expectedRole != undefined) {
                expectedRole.forEach((role) => {
                    if (account?.idTokenClaims?.[role]) {
                        expectedRoleMatch = true;
                    }
                });
            }
            if (expectedRoleMatch) {
                return true;
            }

            // redirect to home page
            router.navigate(['/forbidden']);
            return false;
        })
    );
};
