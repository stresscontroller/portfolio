import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-booking-management',
    templateUrl: './booking-management.component.html',
    styleUrls: ['../../operator.scss', './booking-management.component.scss'],
    imports: [CommonModule, RouterModule],
})
export class BookingManagementComponent {}
