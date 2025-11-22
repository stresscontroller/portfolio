import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ManageComponent as SharedManageComponent } from '../../../../../components';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Features } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-manage',
    templateUrl: './manage.component.html',
    styleUrls: ['./manage.component.scss'],
    imports: [CommonModule, SharedManageComponent],
})
export class ManageComponent {
    features = Features;
    activatedRoute = inject(ActivatedRoute);
    reservationBookingId$ = this.activatedRoute.paramMap.pipe(
        map((params) => {
            return params.get('id');
        })
    );
}
