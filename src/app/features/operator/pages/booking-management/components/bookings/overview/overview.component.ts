import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import {
    AdvancedSearchComponent,
    BookingTableComponent,
    QuickActionsComponent,
} from './components';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { Booking } from '@app/core';
import {
    PermissionConfig,
    PermissionDirective,
    LoaderEmbedComponent,
} from '@app/shared';
import { OverviewService } from './overview.service';

@Component({
    standalone: true,
    selector: 'app-booking-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss', '../bookings.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        DividerModule,
        ButtonModule,
        AdvancedSearchComponent,
        BookingTableComponent,
        QuickActionsComponent,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
    providers: [OverviewService],
})
export class OverviewComponent {
    @Input() bookings: Booking[] = [];
    @Input() isLoading: boolean = false;
    @Input() managePermission?: PermissionConfig;
    @Input() createPermission?: PermissionConfig;
    @Input() exportPermission?: PermissionConfig;
}
