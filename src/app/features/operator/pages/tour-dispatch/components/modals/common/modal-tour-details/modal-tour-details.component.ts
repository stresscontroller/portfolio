import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AppAssignment } from '@app/core';
import {
    IconBookingSearchComponent,
    IconCruiseComponent,
    TourInventoryTimePipe,
} from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-modal-tour-details',
    templateUrl: './modal-tour-details.component.html',
    styleUrls: ['./modal-tour-details.component.scss'],
    imports: [
        CommonModule,

        IconBookingSearchComponent,
        TourInventoryTimePipe,
        IconCruiseComponent,
    ],
})
export class ModalTourDetailsComponent {
    @Input() assignment: AppAssignment | undefined | null;
    @Input() tourDate: Date | undefined | null;
}
