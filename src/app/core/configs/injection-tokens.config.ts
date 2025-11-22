import { InjectionToken } from '@angular/core';
import {
    AuthServiceBase,
    ConnectivityServiceBase,
    SecureStorageServiceBase,
} from '../services';

export const ConnectivityToken = new InjectionToken<ConnectivityServiceBase>(
    'ConnectivityToken'
);

export const AuthToken = new InjectionToken<AuthServiceBase>('AuthToken');

export const SecureStorageToken = new InjectionToken<SecureStorageServiceBase>(
    'SecureStorageToken'
);
