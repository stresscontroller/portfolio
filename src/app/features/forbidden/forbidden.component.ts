import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-forbidden',
    templateUrl: './forbidden.component.html',
    styleUrls: ['./forbidden.component.scss'],
    imports: [CommonModule, NavbarComponent],
})
export class ForbiddenComponent {}
