import { Injectable } from '@angular/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { SecureStorageServiceBase } from '../base';
@Injectable({
    providedIn: 'root',
})
export class MobileSecureStorageService implements SecureStorageServiceBase {
    setItem(key: string, value: string): Promise<void> {
        return SecureStorage.setItem(key, value);
    }

    getItem(key: string): Promise<string | null> {
        return SecureStorage.getItem(key);
    }

    removeItem(key: string): Promise<void> {
        return SecureStorage.removeItem('key');
    }

    clear(): Promise<void> {
        return SecureStorage.clear();
    }
}
