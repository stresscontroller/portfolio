import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    pure: true,
    name: 'customDate',
})
export class CustomDatePipe implements PipeTransform {
    transform(value: string): string {
        const date = new Date(value);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return `${month}/${day}/${year}`;
    }
}
