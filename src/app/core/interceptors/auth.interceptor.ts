import { inject } from '@angular/core';
import {
    HttpErrorResponse,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { catchError } from 'rxjs';
import { AuthToken } from '../configs';

export function AuthInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) {
    const authService = inject(AuthToken);
    const newReq = req.clone();
    return next(newReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // automatically logout the user if they get a 401
            if (error.status === 401) {
                authService.logout();
            }
            throw error;
        })
    );
}
