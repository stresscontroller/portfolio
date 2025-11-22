import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { isTouchDevice, OTCBookingItem } from '@app/core';
import {
    TourInventoryTimePipe,
    IconBookingSearchComponent,
    IconCruiseComponent,
} from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-booking-list',
    templateUrl: './booking-list.component.html',
    styleUrls: ['./booking-list.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        TooltipModule,
        TourInventoryTimePipe,
        IconCruiseComponent,
        IconBookingSearchComponent,
    ],
})
export class BookingListComponent {
    @Input() bookings: OTCBookingItem[] = [];
    touchDevice = isTouchDevice();
}
