import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    pure: true,
    name: 'timeFormat',
})
export class TimeFormatPipe implements PipeTransform {
    transform(value: string): unknown {
        if (parseInt(value) < 12) {
            return `${value.slice(0, 5)} AM`;
        } else if (parseInt(value) === 12) {
            return `${value.slice(0, 5)} PM`;
        } else {
            const hour = parseInt(value.slice(0, 2)) - 12;
            const min = value.slice(3, 5);
            return `${hour}:${min} PM`;
        }
    }
}
