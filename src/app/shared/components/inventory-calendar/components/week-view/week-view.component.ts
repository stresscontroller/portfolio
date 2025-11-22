import { CommonModule, KeyValue, formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import {
    ShipHeightPipe,
    ShipPositionPipe,
    TourHoursPositionPipe,
    TourMinutesPositionPipe,
} from '../../pipes';
import { CalendarData, CalendarShip, CalendarTour } from '../../models';
import { TourDetailsComponent } from '../tour-details/tour-details.component';
import { PermissionConfig } from 'src/app/shared/directives';

@Component({
    standalone: true,
    selector: 'app-week-view',
    templateUrl: './week-view.component.html',
    styleUrls: ['./week-view.component.scss'],
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
export class WeekViewComponent {
    @Input() calendarData: CalendarData | undefined | null;
    @Input() id: string | undefined | null;
    @Input() displayQuickActions = true;
    @Input() allowModifyReleaseInv = false;
    @Input() allowDrag = false;
    @Input() allocatePermission: PermissionConfig | undefined = undefined;
    @Input() releasePermission: PermissionConfig | undefined = undefined;
    @Input() deletePermission: PermissionConfig | undefined = undefined;
    @Input() editPermission: PermissionConfig | undefined = undefined;
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
    @Output() dragInventory = new EventEmitter<{
        event: DragEvent;
        tour: CalendarTour;
    }>();
    @Output() dropInventory = new EventEmitter<{
        event: DragEvent;
        targetDate: string;
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

    onDragStart(event: DragEvent, tour: CalendarTour): void {
        const targetElement = event.target as HTMLElement;
        if (!targetElement) {
            return;
        }
        this.dragInventory.emit({
            event,
            tour,
        });
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

    onDrop(event: DragEvent, targetDate: string): void {
        event.preventDefault();
        this.dropInventory.emit({
            event,
            targetDate,
        });
    }
}
