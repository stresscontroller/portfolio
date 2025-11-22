import { Component, Input, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { AdvancedSearchFields, OverviewService } from '../../overview.service';
import {
    BehaviorSubject,
    Subject,
    combineLatest,
    debounceTime,
    map,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs';
import { FilterMatchMode, FilterService, SortEvent } from 'primeng/api';
import { UserState, debounceTimes, Booking } from '@app/core';
import { BookingIsactivePipe } from './booking-isactive.pipe';
import { PermissionConfig, PermissionDirective } from '@app/shared';

type BasicExpression = {
    key: string;
    operation: FilterMatchMode | 'customDateStart' | 'customDateEnd';
    value?: string;
    formatter?: (value: string) => string | Date | undefined;
};

@Component({
    standalone: true,
    selector: 'app-booking-table',
    templateUrl: './booking-table.component.html',
    styleUrls: ['./booking-table.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        TableModule,
        BookingIsactivePipe,
        PermissionDirective,
    ],
})
export class BookingTableComponent {
    @ViewChild('bookingTable') bookingTable?: Table;
    @Input() receivedMessage: string | undefined;
    @Input() set bookings(value: Booking[]) {
        this.rawBookings$.next(value || []);
    }

    @Input() managePermission?: PermissionConfig;

    currentDate: Date = new Date();

    tableFilterService = inject(FilterService);
    overviewService = inject(OverviewService);
    userState = inject(UserState);
    private filteredBookings: Booking[] = [];
    rawBookings$ = new BehaviorSubject<Booking[]>([]);

    bookings$ = this.overviewService.isActiveFilter$.pipe(
        switchMap((isActive) => {
            if (this.bookingTable) {
                this.bookingTable.first = 0;
            }
            return this.rawBookings$.pipe(
                map((bookings) => {
                    if (!bookings || bookings.length === 0) {
                        return [];
                    }
                    // default to 12 am today
                    const targetDate = new Date(
                        new Date(
                            new Date().setDate(new Date().getDate())
                        ).setHours(0, 0, 0, 0)
                    );
                    if (isActive) {
                        return bookings.filter((booking) => {
                            return (
                                new Date(booking.bookingDateString).getTime() >=
                                    new Date(targetDate).getTime() &&
                                (booking.isActive ||
                                    (!booking.isActive &&
                                        booking.isFullyRefundable === false))
                            );
                        });
                    } else {
                        return bookings.filter((booking) => {
                            return (
                                (!booking.isActive &&
                                    new Date(
                                        booking.bookingDateString
                                    ).getTime() >=
                                        new Date(targetDate).getTime()) ||
                                new Date(booking.bookingDateString).getTime() <
                                    new Date(targetDate).getTime()
                            );
                        });
                    }
                }),
                map((filteredBookings) => {
                    return filteredBookings.sort((a, b) => {
                        return (
                            new Date(a.bookingDateString).getTime() -
                            new Date(b.bookingDateString).getTime()
                        );
                    });
                }),
                tap((filteredBookings) => {
                    this.filteredBookings = filteredBookings;
                })
            );
        })
    );

    private readonly isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.listenToFilterUpdates();
        this.setupCustomFilters();
    }

    ngAfterViewInit(): void {
        if (this.bookingTable) {
            this.overviewService.setBookingTable(this.bookingTable);
        }
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next(undefined);
        this.isDestroyed$.complete();
    }

    private listenToFilterUpdates(): void {
        combineLatest([
            this.overviewService.advancedSearch$,
            this.overviewService.quickSearch$,
        ])
            .pipe(
                debounceTime(debounceTimes.filterDebounce),
                takeUntil(this.isDestroyed$)
            )
            .subscribe(([advancedSearch, quickSearch]) => {
                if (!this.bookingTable) {
                    return;
                }
                this.bookingTable.value = this.filteredBookings;
                this.advancedSearch(advancedSearch);
                this.quickSearch(quickSearch);
            });
    }

    private setupCustomFilters(): void {
        this.tableFilterService.register(
            'customDateStart',
            (value: string, filter: Date): boolean => {
                return new Date(value).getTime() >= new Date(filter).getTime();
            }
        );
        this.tableFilterService.register(
            'customDateEnd',
            (value: string, filter: Date): boolean => {
                return new Date(value).getTime() <= new Date(filter).getTime();
            }
        );
        this.tableFilterService.register(
            'containsArray',
            (
                value: string | number | boolean,
                filter: (string | number | boolean)[]
            ): boolean => {
                return filter.includes(value);
            }
        );
    }

    private quickSearch(text: string): void {
        if (!this.bookingTable) {
            return;
        }
        this.bookingTable.filterGlobal(text, 'contains');
    }

    private advancedSearch(searchFields: AdvancedSearchFields): void {
        if (!this.bookingTable) {
            return;
        }

        const searchExpressions = Object.entries(searchFields).reduce<
            BasicExpression[]
        >((acc, [key, value]) => {
            const searchSetting = this.advancedSearchSetting[key];
            if (searchSetting) {
                const search = {
                    ...searchSetting,
                    value: searchSetting.formatter
                        ? searchSetting.formatter(value)
                        : value,
                };
                acc.push(search);
            }
            return acc;
        }, []);
        if (searchExpressions.length > 0) {
            searchExpressions.forEach((expression: BasicExpression) => {
                // use custom filter for dates as the out of the box solution doesn't quite work with our setup
                if (
                    expression.operation === 'customDateStart' ||
                    expression.operation === 'customDateEnd'
                ) {
                    if (expression.value) {
                        this.bookingTable!.value =
                            this.tableFilterService.filter(
                                this.bookingTable!.value,
                                [expression.key],
                                expression.value,
                                expression.operation as string
                            );
                    }
                } else {
                    this.bookingTable?.filter(
                        expression.value || '',
                        expression.key,
                        expression.operation as string
                    );
                }
            });
        }
    }

    private dateFormatter(value: string): Date | undefined {
        if (!value) {
            return undefined;
        }
        return new Date(new Date(value).setHours(0, 0, 0, 0));
    }

    private stringFormatter(value: string): string | undefined {
        if (!value) {
            return undefined;
        }
        // const charArray = value.split('');

        // // Sort the array of characters
        // const sortedCharArray = charArray.sort();

        // // Join the sorted characters back into a string
        // const sortedString = sortedCharArray.join('');
        const sortedString = value;

        return sortedString;
    }

    private advancedSearchSetting: Record<string, BasicExpression> = {
        firstName: {
            key: 'firstName',
            formatter: (value) => this.stringFormatter(value),
            operation: FilterMatchMode.CONTAINS,
        },
        lastName: {
            key: 'lastName',
            formatter: (value) => this.stringFormatter(value),
            operation: FilterMatchMode.CONTAINS,
        },
        email: {
            key: 'agentsGuestEmail',
            formatter: (value) => this.stringFormatter(value),
            operation: FilterMatchMode.CONTAINS,
        },
        phone: {
            key: 'phoneNumber',
            operation: FilterMatchMode.CONTAINS,
        },
        bookingNumber: {
            key: 'bookingNumber',
            operation: FilterMatchMode.CONTAINS,
        },
        orderId: {
            key: 'orderID',
            operation: FilterMatchMode.CONTAINS,
        },
        fromDate: {
            key: 'bookingDateString',
            formatter: (value) => this.dateFormatter(value),
            operation: 'customDateStart',
        },
        toDate: {
            key: 'bookingDateString',
            formatter: (value) => this.dateFormatter(value),
            operation: 'customDateEnd',
        },
    };

    customSort(event: SortEvent) {
        const field = event.field;
        const order = event.order;
        if (event.data && field && order) {
            if (
                field === 'bookingDateString' ||
                field === 'purchaseDateString'
            ) {
                // date sort
                event.data.sort((data1, data2) => {
                    const value1 = data1[field];
                    const value2 = data2[field];
                    let result = null;

                    if (value1 == null && value2 != null) result = -1;
                    else if (value1 != null && value2 == null) result = 1;
                    else if (value1 == null && value2 == null) result = 0;
                    else if (
                        typeof value1 === 'string' &&
                        typeof value2 === 'string'
                    ) {
                        const date1 = new Date(value1);
                        const date2 = new Date(value2);

                        // Compare by year
                        result = date1.getFullYear() - date2.getFullYear();
                        if (result === 0) {
                            // If the years are the same, compare by month
                            result = date1.getMonth() - date2.getMonth();
                            if (result === 0) {
                                // If the months are the same, compare by day
                                result = date1.getDate() - date2.getDate();
                            }
                        }
                    } else {
                        // Fallback comparison for non-string values
                        result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
                    }

                    // Multiply by sorting order
                    return order * result;
                });
            } else {
                // normal sort
                event.data.sort((data1, data2) => {
                    const value1 = data1[field];
                    const value2 = data2[field];
                    let result = null;

                    if (value1 == null && value2 != null) result = -1;
                    else if (value1 != null && value2 == null) result = 1;
                    else if (value1 == null && value2 == null) result = 0;
                    else if (
                        typeof value1 === 'string' &&
                        typeof value2 === 'string'
                    )
                        result = value1.localeCompare(value2);
                    else
                        result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

                    return order * result;
                });
            }
        }
    }
}
