import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TimeFormatPipe } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-time-slot',
    templateUrl: './time-slot.component.html',
    styleUrls: ['./time-slot.component.scss'],
    imports: [CommonModule, TagModule, TimeFormatPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeSlotComponent {
    @Input() timeSlot:
        | {
              availableSeats: number;
              tourInventoryTime: string;
              disabled?: boolean;
          }
        | undefined = undefined;

    @Input() bookedSeats = 0;

    displaySeatsRemainingLimit = 6;
    timeType = 'default';

    ngOnChanges(): void {
        this.setTag();
    }

    private setTag(): void {
        if (this.timeSlot) {
            if (this.timeSlot.availableSeats === 0) {
                this.timeType = 'soldout';
            } else if (
                this.timeSlot.availableSeats - this.bookedSeats >
                this.displaySeatsRemainingLimit
            ) {
                this.timeType = 'default';
            } else if (
                this.timeSlot.availableSeats - this.bookedSeats <=
                    this.displaySeatsRemainingLimit &&
                this.timeSlot.availableSeats - this.bookedSeats >= 0
            ) {
                // If seats minus booking seats is less than or equal to displaySeatsRemainingLimit
                // but greater than zero,  display time and the total amount of seats
                this.timeType = 'limitedSeat';
            } else if (
                this.timeSlot.availableSeats - this.bookedSeats < 0 &&
                this.timeSlot.availableSeats !== 0
            ) {
                // If seats minus booking seats is less than displaySeatsRemainingLimit but the
                // timeSlot is not sold out ,  display time and the total amount of seats  but disabled
                this.timeType = 'limitedSeatDisabled';
            }
        }
    }
}
