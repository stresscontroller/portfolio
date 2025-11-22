import { Injectable } from '@angular/core';
import { SecureStorageServiceBase } from '../base';

@Injectable({
    providedIn: 'root',
})
export class BrowserSecureStorageService implements SecureStorageServiceBase {
    setItem(key: string, value: string): Promise<void> {
        // Not implemented
        return Promise.resolve();
    }

    getItem(key: string): Promise<string | null> {
        // Not implemented
        return Promise.resolve(null);
    }

    removeItem(key: string): Promise<void> {
        // Not implemented
        return Promise.resolve();
    }

    clear(): Promise<void> {
        // Not implemented
        return Promise.resolve();
    }
}
