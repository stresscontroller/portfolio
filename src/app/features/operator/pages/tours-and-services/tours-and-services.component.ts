import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToursAndServicesState } from './state';

@Component({
    standalone: true,
    selector: 'app-tours-and-services',
    templateUrl: './tours-and-services.component.html',
    imports: [CommonModule, RouterModule],
    providers: [ToursAndServicesState],
})
export class ToursAndServicesComponent {
    toursAndServicesState = inject(ToursAndServicesState);

    ngOnInit(): void {
        this.toursAndServicesState.init();
    }
}
