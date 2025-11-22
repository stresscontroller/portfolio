import { AbstractControl } from '@angular/forms';

export function ZipCodeValidator(control: AbstractControl) {
    if (ZipCodeIsValid(control.value)) {
        return null;
    }
    return { invalidZipCode: true };
}

export const ZipCodeIsValid = (zipCode: string): boolean => {
    if (!zipCode) {
        return false;
    }
    // accepts the 9 digit format (00000-0000) and 5 digit format (00000)
    return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipCode);
};
