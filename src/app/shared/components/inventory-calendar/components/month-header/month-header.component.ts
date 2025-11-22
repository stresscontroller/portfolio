import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-month-header',
    templateUrl: './month-header.component.html',
    styleUrls: ['./month-header.component.scss'],
    imports: [CommonModule, FormsModule],
})
export class MonthHeaderComponent {
    @Input() days: { isWeekend: boolean; date: Date }[] = [];
}
