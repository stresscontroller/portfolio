import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-week-header',
    templateUrl: './week-header.component.html',
    styleUrls: ['./week-header.component.scss'],
    imports: [CommonModule, FormsModule],
})
export class WeekHeaderComponent {
    @Input() days: { isWeekend: boolean; date: Date }[] = [];
}
