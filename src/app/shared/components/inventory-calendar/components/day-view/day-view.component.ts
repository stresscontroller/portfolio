import { CommonModule, KeyValue, formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import {
    TourMinutesPositionPipe,
    ShipHeightPipe,
    ShipPositionPipe,
    TourHoursPositionPipe,
} from '../../pipes';
import { CalendarData, CalendarShip, CalendarTour } from '../../models';
import { TourDetailsComponent } from '../tour-details/tour-details.component';
import { PermissionConfig } from 'src/app/shared/directives';

@Component({
    standalone: true,
    selector: 'app-day-view',
    templateUrl: './day-view.component.html',
    styleUrls: ['./day-view.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        OverlayPanelModule,
        ShipPositionPipe,
        ShipHeightPipe,
        TourHoursPositionPipe,
        TourMinutesPositionPipe,
        TourDetailsComponent,
    ],
})
export class DayViewComponent {
    @Input() calendarData: CalendarData | undefined | null;
    @Input() id: string | undefined | null;
    @Input() displayQuickActions = true;
    @Input() allowModifyReleaseInv = false;
    @Input() allocatePermission: PermissionConfig | undefined = undefined;
    @Input() releasePermission: PermissionConfig | undefined = undefined;
    @Input() deletePermission: PermissionConfig | undefined = undefined;
    @Input() editPermission: PermissionConfig | undefined = undefined;
    @Input() allowDrag = false;
    @Output() allocateInventory = new EventEmitter<{
        tour: CalendarTour;
        ships: CalendarShip[];
    }>();
    @Output() releaseInventory = new EventEmitter<CalendarTour>();
    @Output() deleteInventory = new EventEmitter<CalendarTour>();
    @Output() editInventory = new EventEmitter<{
        tour: CalendarTour;
        ships: CalendarShip[];
    }>();
    @Output() moveInventory = new EventEmitter<{
        tour: CalendarTour;
        proposedDateTime: Date;
    }>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tourSort = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
        const [ahr, amin] = a.key.split('-');
        const [bhr, bmin] = b.key.split('-');
        if (+ahr > +bhr) {
            return -1;
        }
        if (ahr === bhr && +amin > +bmin) {
            return -1;
        }
        return 1;
    };

    onAllocateInventory(tour: CalendarTour): void {
        if (tour) {
            const calendarShipId = formatDate(
                new Date(tour.start),
                'yyyy-MM-dd',
                'en-US'
            );
            this.allocateInventory.emit({
                tour,
                ships: this.calendarData?.ships?.[calendarShipId] || [],
            });
        }
    }

    onEditInventory(tour: CalendarTour): void {
        if (tour) {
            const calendarShipId = formatDate(
                new Date(tour.start),
                'yyyy-MM-dd',
                'en-US'
            );
            this.editInventory.emit({
                tour,
                ships: this.calendarData?.ships?.[calendarShipId] || [],
            });
        }
    }

    private tourDragged: {
        originalPosition: number | null;
        originalOffsetY: number | null;
        tour: CalendarTour;
    } | null = null;
    onDragStart(event: DragEvent, tour: CalendarTour): void {
        const targetElement = event.target as HTMLElement;
        if (!targetElement) {
            return;
        }
        this.tourDragged = {
            tour,
            originalOffsetY: window.scrollY,
            originalPosition: event.clientY,
        };
        targetElement.style.opacity = '0.2';
    }

    onDragEnd(event: DragEvent): void {
        const targetElement = event.target as HTMLElement;
        if (!targetElement) {
            return;
        }
        targetElement.style.opacity = '1';
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();

        const currentOffsetTop = window.scrollY;
        if (this.tourDragged && this.tourDragged.originalPosition !== null) {
            const positionChange =
                event.clientY -
                this.tourDragged.originalPosition +
                (currentOffsetTop - (this.tourDragged.originalOffsetY || 0));

            const startTime = this.tourDragged.tour.start;
            const hoursSinceStartOfDay =
                startTime.getHours() * 60 + startTime.getMinutes();
            const proposedTimeChange = hoursSinceStartOfDay + positionChange;
            let newHour = Math.floor(proposedTimeChange / 60);

            const newMinutes = proposedTimeChange % 60;
            // if it's going to be rounded to the next hour, make sure to add an hour to the hours variable
            if (newMinutes > 52.5) {
                newHour += 1;
            }
            // round to nearest 15 minute interval
            const roundedNewMinutes = (Math.round(newMinutes / 15) * 15) % 60;
            const proposedDateTime = new Date(this.tourDragged.tour.start);
            proposedDateTime.setHours(newHour, roundedNewMinutes);
            if (this.moveInventory) {
                this.moveInventory.emit({
                    tour: this.tourDragged.tour,
                    proposedDateTime,
                });
            }
            this.tourDragged = null;
        }
    }
}
