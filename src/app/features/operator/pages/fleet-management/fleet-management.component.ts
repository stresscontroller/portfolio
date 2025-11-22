import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-fleet-management',
    templateUrl: './fleet-management.component.html',
    styleUrls: ['../../operator.scss', './fleet-management.component.scss'],
    imports: [CommonModule, RouterModule],
})
export class FleetManagementComponent {}
