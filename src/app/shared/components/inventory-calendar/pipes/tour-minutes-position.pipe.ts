import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    pure: true,
    name: 'tourMinutesPosition',
})
export class TourMinutesPositionPipe implements PipeTransform {
    transform(value: Date, groupingStart: Date): string {
        const origin =
            groupingStart.getHours() * 60 + groupingStart.getMinutes();
        const minutes = value.getHours() * 60 + value.getMinutes();
        // 1 minute = 1 pixel
        return `${minutes - origin}px`;
    }
}
