import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    pure: true,
    name: 'shipPosition',
})
export class ShipPositionPipe implements PipeTransform {
    transform(value: Date, dayStart = 0): string {
        const dayStartMinutes = dayStart * 60;
        const hours = value.getHours();
        const minutes = value.getMinutes();
        // 1 minute = 1 pixel
        const distanceFromTop = `${hours * 60 + minutes - dayStartMinutes}px`;
        return distanceFromTop;
    }
}
