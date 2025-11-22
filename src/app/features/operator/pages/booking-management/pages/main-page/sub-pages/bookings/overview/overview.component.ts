import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { OverviewComponent as SharedOverviewComponent } from '../../../../../components';
import { BookingsService } from './overview.service';
import { Features } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
    imports: [CommonModule, SharedOverviewComponent],
    providers: [BookingsService],
})
export class OverviewComponent {
    bookingsService = inject(BookingsService);
    bookings$ = this.bookingsService.bookings$;
    isLoading$ = this.bookingsService.isLoading$;
    features = Features;

    ngOnInit(): void {
        this.bookingsService.getAgentBookingList();
    }
}
