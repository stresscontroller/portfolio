import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { lastValueFrom } from 'rxjs';
import { DtdApiService } from '@app/core';
import { CruiseCalendarApiService } from 'src/app/core/services/api/cruise-calendar-api.service';

@Component({
    standalone: true,
    selector: 'app-api',
    templateUrl: './api.component.html',
    styleUrls: ['./api.component.scss'],
    imports: [CommonModule, ButtonModule, DividerModule],
})
export class ApiComponent {
    // inject the API service here
    // tourInventoryService = inject(TourInventoryApiService);
    cruiseCalendarApiService = inject(CruiseCalendarApiService);
    result: any = undefined;
    error: any = undefined;
    cuid = '72aca93d-62a8-48e8-abf5-9814dc7604ae';
    testApi(): void {
        this.result = undefined;
        this.error = undefined;

        lastValueFrom(
            // To test API calls, replace the line below with the
            // function call you want to test with the parameters passed in,
            // everything else should work without having to be modified
            // this.tourInventoryService.getShipCompanyList()
            this.cruiseCalendarApiService.saveDockAssignmentDetail(
                this.cuid,
                1,
                '2023-10-25',
                14,
                2
            )
        )
            .then((res) => {
                this.result = res;
                console.log(res);
            })
            .catch((err) => {
                this.error = err;
            });
    }
}
