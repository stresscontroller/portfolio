import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    pure: true,
    standalone: true,
    name: 'tourInventoryTime',
})
export class TourInventoryTimePipe implements PipeTransform {
    // convert time from 09:00:00 to 09:00
    transform(time: string): string {
        if (!time) {
            return '';
        }
        return time.substring(0, time.lastIndexOf(':'));
    }
}
