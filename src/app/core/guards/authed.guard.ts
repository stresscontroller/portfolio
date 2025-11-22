import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthToken } from '../configs';

export const authedGuardCanActivate: CanActivateFn = (route) => {
    const authService = inject(AuthToken);
    const router = inject(Router);
    return authService.authInProgress$.pipe(
        filter((isInProgress) => !isInProgress),
        map(() => {
            const account = authService.getAccount();
            if (!account) {
                return true;
            }
            // redirect to operator home page
            router.navigate(['/operator']);
            return false;
        })
    );
};
