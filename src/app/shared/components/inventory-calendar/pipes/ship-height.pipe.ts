import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    pure: true,
    name: 'shipHeight',
})
export class ShipHeightPipe implements PipeTransform {
    transform(endDate: Date | null, startDate: Date): string {
        if (!endDate) {
            // assume 5 hours if no end date is returned
            return `${5 * 60}px`;
        }
        // 1 minute = 1 pixel
        const cellHeight = `${
            endDate.getHours() * 60 +
            endDate.getMinutes() -
            (startDate.getHours() * 60 + startDate.getMinutes())
        }px`;
        return cellHeight;
    }
}
