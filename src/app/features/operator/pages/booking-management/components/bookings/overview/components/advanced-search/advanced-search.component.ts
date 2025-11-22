import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { AdvancedSearchFields, OverviewService } from '../../overview.service';

@Component({
    standalone: true,
    selector: 'app-advanced-search',
    templateUrl: './advanced-search.component.html',
    styleUrls: ['./advanced-search.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        CalendarModule,
        DialogModule,
        InputTextModule,
    ],
})
export class AdvancedSearchComponent {
    @ViewChild('fromDate') fromDate?: Calendar;
    @ViewChild('toDate') toDate?: Calendar;

    overviewService = inject(OverviewService);

    searchFields: AdvancedSearchFields = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bookingNumber: '',
        orderId: '',
        fromDate: null,
        toDate: null,
    };

    displayAdvancedSearchDialog = false;

    onFromDateChange(date: string): void {
        // prevent users from selecting dates before the min date
        if (this.toDate) {
            this.toDate.minDate = new Date(date);
        }
    }

    onToDateChange(date: string): void {
        // prevent users from selecting dates after the max date
        if (this.fromDate) {
            this.fromDate.maxDate = new Date(date);
        }
    }

    submit(): void {
        this.overviewService.updateAdvancedSearch(this.searchFields);
        this.hideAdvancedSearchDialog();
    }

    showAdvancedSearchDialog(): void {
        this.displayAdvancedSearchDialog = true;
    }

    hideAdvancedSearchDialog(): void {
        this.displayAdvancedSearchDialog = false;
    }
}
