import { Pipe, PipeTransform } from '@angular/core';
import { Booking } from '@app/core';

@Pipe({
    standalone: true,
    pure: true,
    name: 'bookingIsActive',
})
export class BookingIsactivePipe implements PipeTransform {
    transform(value: Booking): boolean {
        if (!value.isActive) {
            return false;
        }

        const bookingDate = new Date(value.bookingDateString).getTime();
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const midnightTimestamp = now.getTime();
        const inThePast = bookingDate >= midnightTimestamp;
        return inThePast;
    }
}
