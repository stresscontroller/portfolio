import { Injectable } from '@angular/core';

// if we want to add more keys to local storage, make sure
// to add them here so we can strongly type them
type StorageKeys =
    | 'cart'
    | 'cartStorageVersion'
    | 'lastSearchParams'
    | 'redirectPostLogIn'
    | 'skipLoginSuccess';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    setItem(key: StorageKeys, value: string): void {
        localStorage.setItem(key, value);
    }

    getItem(key: StorageKeys): string | null {
        return localStorage.getItem(key);
    }

    removeItem(key: StorageKeys): void {
        localStorage.removeItem(key);
    }

    clear(): void {
        localStorage.clear();
    }
}
