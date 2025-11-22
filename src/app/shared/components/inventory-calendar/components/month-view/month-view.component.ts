import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TourCountPipe } from '../../pipes';
import { CalendarMonthDay } from '../../models';
import { PermissionConfig, PermissionDirective } from '../../../../directives';
import { Features } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-month-view',
    templateUrl: './month-view.component.html',
    styleUrls: ['./month-view.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        OverlayPanelModule,
        TourCountPipe,
        PermissionDirective,
    ],
})
export class MonthViewComponent {
    @Input() day: { date: Date; events: CalendarMonthDay[] } | undefined;
    @Input() displayAddUnallocatedButton = false;
    @Input() addUnallocatedPermission: PermissionConfig | undefined = undefined;
    @Output() addClicked = new EventEmitter<void>();

    features = Features;

    addUnallocatedInventory(): void {
        this.addClicked.emit();
    }
}
