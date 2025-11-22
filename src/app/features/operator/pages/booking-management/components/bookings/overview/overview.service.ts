import { formatDate } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import {
    AgentApiService,
    CsvService,
    getCurrentDateTimeStamp,
    UIState,
} from '@app/core';
import { BehaviorSubject } from 'rxjs';
import { Table } from 'primeng/table';

export interface AdvancedSearchFields {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bookingNumber: string;
    orderId: string;
    fromDate: Date | null;
    toDate: Date | null;
}

const advancedSearchFieldsInitial: AdvancedSearchFields = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bookingNumber: '',
    orderId: '',
    fromDate: null,
    toDate: null,
};

@Injectable()
export class OverviewService {
    agentService = inject(AgentApiService);

    uiState = inject(UIState);
    csvService = inject(CsvService);

    bookingTable: Table | undefined = undefined;

    quickSearch$ = new BehaviorSubject<string>('');
    isActiveFilter$ = new BehaviorSubject<boolean>(true);
    advancedSearch$ = new BehaviorSubject<AdvancedSearchFields>(
        advancedSearchFieldsInitial
    );

    setBookingTable(table: Table): void {
        this.bookingTable = table;
    }

    setIsActiveFilter(isActive: boolean): void {
        this.isActiveFilter$.next(isActive);
    }

    updateQuickSearch(text: string): void {
        this.quickSearch$.next(text);
    }

    resetQuickSearch(): void {
        this.quickSearch$.next('');
    }

    updateAdvancedSearch(updatedFields: AdvancedSearchFields): void {
        this.advancedSearch$.next(updatedFields);
    }

    resetAdvancedSearch(): void {
        this.advancedSearch$.next(advancedSearchFieldsInitial);
    }

    exportExcel(): void {
        const filteredBookings =
            this.bookingTable?.filteredValue || this.bookingTable?.value || [];

        // Extracting data with selected columns and mapping column names to object keys
        const formattedBooking = filteredBookings.map((row) => {
            return {
                'Order ID': row.orderID.slice(-12),
                'Booking Number': row.bookingNumber,
                'Purchase Date': row.purchaseDateString,
                'Booking Date': row.bookingDateString,
                Tour: row.tourName,
                'First Name': row.firstName,
                'Last Name': row.lastName,
                'Guest Email': row.agentsGuestEmail || row.bookingEmail,
                'Phone Number': row.phoneNumber,
                Adults: row.adults,
                Kids: row.children,
            };
        });

        const advancedSearchParams = this.advancedSearch$.getValue();
        const filterData = [
            {
                fieldName: 'First Name',
                fieldValue: advancedSearchParams.firstName ?? '',
            },
            {
                fieldName: 'Last Name',
                fieldValue: advancedSearchParams.lastName ?? '',
            },
            {
                fieldName: 'Email',
                fieldValue: advancedSearchParams.email ?? '',
            },
            {
                fieldName: 'Phone Number',
                fieldValue: advancedSearchParams.phone ?? '',
            },
            {
                fieldName: 'Booking Number',
                fieldValue: advancedSearchParams.bookingNumber ?? '',
            },
            {
                fieldName: 'Order ID',
                fieldValue: advancedSearchParams.orderId ?? '',
            },
            {
                fieldName: 'Start Date',
                fieldValue: advancedSearchParams.fromDate
                    ? formatDate(
                          advancedSearchParams.fromDate,
                          'MM/dd/yyyy',
                          'en-US'
                      )
                    : '',
            },
            {
                fieldName: 'End Date',
                fieldValue: advancedSearchParams.toDate
                    ? formatDate(
                          advancedSearchParams.toDate,
                          'MM/dd/yyyy',
                          'en-US'
                      )
                    : '',
            },
        ];

        // Generating filename with timestamp
        const timestamp = getCurrentDateTimeStamp();

        this.csvService.exportToCsv({
            filterData,
            mainData: formattedBooking,
            spaceBetweenFilterAndDate: 2,
            filename: `booking_${timestamp}`,
            fileExtension: 'xlsx',
        });
    }
}
