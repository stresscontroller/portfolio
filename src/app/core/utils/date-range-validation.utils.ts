import { AbstractControl, ValidatorFn, FormGroup } from '@angular/forms';

export function dateRangeValidator(
    startDateField: string,
    endDateField: string
): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
        const formGroup = control as FormGroup;
        const startDate = formGroup.controls[startDateField]?.value;
        const endDate = formGroup.controls[endDateField]?.value;

        if (!startDate || !endDate) {
            return null; // don't validate if one of the dates is missing
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        return start < end ? null : { invalidDateRange: true };
    };
}
