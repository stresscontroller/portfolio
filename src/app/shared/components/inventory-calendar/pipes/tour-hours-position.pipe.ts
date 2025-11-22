import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    pure: true,
    name: 'tourHoursPosition',
})
export class TourHoursPositionPipe implements PipeTransform {
    transform(value: Date, dayStart = 0): string {
        const dayStartMinutes = dayStart * 60;
        const minutes =
            value.getHours() * 60 + value.getMinutes() - dayStartMinutes;
        // 1 minute = 1 pixel
        return `${minutes}px`;
    }
}
