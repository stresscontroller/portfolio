import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CalendarTour } from '../../models';
import { ButtonModule } from 'primeng/button';
import { Features } from '@app/core';
import { PermissionConfig, PermissionDirective } from '../../../../directives';

@Component({
    standalone: true,
    selector: 'app-tour-details',
    templateUrl: './tour-details.component.html',
    styleUrls: ['./tour-details.component.scss'],
    imports: [CommonModule, ButtonModule, PermissionDirective],
})
export class TourDetailsComponent {
    @Input() tour: CalendarTour | undefined = undefined;
    @Input() displayQuickActions = true;
    @Input() allowModifyReleaseInv = false;
    @Input() allocatePermission: PermissionConfig | undefined = undefined;
    @Input() releasePermission: PermissionConfig | undefined = undefined;
    @Input() deletePermission: PermissionConfig | undefined = undefined;
    @Input() editPermission: PermissionConfig | undefined = undefined;
    @Output() allocateInventory = new EventEmitter<CalendarTour>();
    @Output() releaseInventory = new EventEmitter<CalendarTour>();
    @Output() deleteInventory = new EventEmitter<CalendarTour>();
    @Output() editInventory = new EventEmitter<CalendarTour>();
    features = Features;
    onAllocateInventory(): void {
        if (this.tour) {
            this.allocateInventory.emit(this.tour);
        }
    }

    onReleaseInventory(): void {
        if (this.tour) {
            this.releaseInventory.emit(this.tour);
        }
    }

    onDeleteInventory(): void {
        if (this.tour) {
            this.deleteInventory.emit(this.tour);
        }
    }

    onEditInventory(): void {
        if (this.tour) {
            this.editInventory.emit(this.tour);
        }
    }
}
