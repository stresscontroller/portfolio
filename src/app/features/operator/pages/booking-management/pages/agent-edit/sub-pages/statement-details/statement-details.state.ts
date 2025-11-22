import { Injectable, inject } from '@angular/core';
import {
    AgentApiService,
    UIState,
    UserState,
    ErrorDialogMessages,
    AgentBookingStatement,
    UIStatus,
} from '@app/core';
import {
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    filter,
    from,
    lastValueFrom,
    map,
    switchMap,
} from 'rxjs';
import { AgentEditState } from '../../state';
import * as XLSX from 'xlsx';
import { CurrencyPipe } from '@angular/common';

export interface ViewStatementConfig {
    startDate: string;
    endDate: string;
    agentId: number;
    month: string;
    year: number;
}

@Injectable()
export class StatementDetailsState {
    userState = inject(UserState);
    uiState = inject(UIState);
    agentApiService = inject(AgentApiService);

    viewStatements$ = new BehaviorSubject<{
        config: ViewStatementConfig | undefined;
        data: AgentBookingStatement[];
    }>({
        config: undefined,
        data: [],
    });

    statementSummary$ = this.viewStatements$.pipe(
        map((statements) => {
            return this.formatSummary(statements.data);
        })
    );

    refreshTriggered$ = new BehaviorSubject<number>(0);

    agentEditState = inject(AgentEditState);
    status$ = new BehaviorSubject<UIStatus>('idle');
    viewStatus$ = new BehaviorSubject<UIStatus>('idle');

    editAgentId$ = this.agentEditState.editAgentId$;

    private initialized = false;
    private cp: CurrencyPipe = new CurrencyPipe('en-US');
    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.initViewStatements();
    }

    formatSummary(statements: AgentBookingStatement[]) {
        // Add up the details
        const contextToPass = {
            previousBalance: 0,
            totalSales: 0,
            totalPayments: 0,
            fees: 0,
            totalDue: 0,
        };

        statements.forEach((element) => {
            if (element.bookingNumber == 'PAYMENT') {
                contextToPass.totalPayments += element.netAmount;
                contextToPass.totalDue -= element.netAmount;
            } else if (element.bookingNumber == 'PAST DUE') {
                contextToPass.previousBalance += element.netAmount;
                contextToPass.totalDue += element.netAmount;
            } else {
                contextToPass.totalSales += element.netAmount;

                if (element.paymentType == 'InvoiceLater') {
                    contextToPass.totalDue +=
                        element.netAmount +
                        element.salesTaxOnNet +
                        element.feeOnNet;

                    contextToPass.fees +=
                        element.feeOnNet + element.salesTaxOnNet;
                } else {
                    contextToPass.totalDue +=
                        element.netAmount +
                        element.salesTaxOnNet +
                        element.feeOnNet -
                        (element.salesTax +
                            element.fee +
                            element.totalSalesAmount);
                    contextToPass.totalPayments +=
                        element.salesTax +
                        element.fee +
                        element.totalSalesAmount;
                    contextToPass.fees +=
                        element.feeOnNet + element.salesTaxOnNet;
                }
            }
        });

        return contextToPass;
    }

    updateViewStatementConfig(config: ViewStatementConfig | undefined): void {
        this.viewStatements$.next({
            config: config,
            data: [],
        });
    }

    private initViewStatements(): void {
        this.userState.aspNetUser$
            .pipe(
                filter((user) => !!user),
                distinctUntilChanged(),
                switchMap(() => {
                    return combineLatest([
                        this.viewStatements$.pipe(
                            map((viewStatements) => viewStatements.config)
                        ),
                        this.refreshTriggered$,
                    ]).pipe(
                        distinctUntilChanged(
                            (
                                [previousConfig, previousRefreshTriggered],
                                [currentConfig, currentRefreshTriggered]
                            ) => {
                                return (
                                    previousRefreshTriggered ===
                                        currentRefreshTriggered &&
                                    JSON.stringify(previousConfig) ===
                                        JSON.stringify(currentConfig)
                                );
                            }
                        ),
                        map(([config]) => config),
                        filter((config) => !!config),
                        switchMap((config) => {
                            return from(this.loadViewStatements(config));
                        })
                    );
                })
            )
            .subscribe();
    }

    loadViewStatements(config: ViewStatementConfig | undefined): Promise<void> {
        if (!config) {
            return Promise.reject('undefined');
        }
        const year = new Date(config.startDate).getFullYear();
        this.viewStatements$.next({
            config: this.viewStatements$.getValue().config,
            data: [],
        });
        this.viewStatus$.next('loading');
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (user?.companyUniqueID) {
                    return lastValueFrom(
                        this.agentApiService.getAgentStatementsDateRange(
                            config.agentId,
                            year,
                            config.startDate,
                            config.endDate
                        )
                    ).then((res) => {
                        return Promise.resolve(res.data);
                    });
                }
                return Promise.reject('missing statement information');
            })
            .then((statements) => {
                this.viewStatus$.next('success');
                // Sort the statements
                const sortedStatements = statements.sort((a, b) => {
                    const dateA = new Date(a.bookingDateString);
                    const dateB = new Date(b.bookingDateString);
                    return dateA.getTime() - dateB.getTime();
                });

                const pastDue = sortedStatements.pop();
                if (pastDue) {
                    sortedStatements.splice(0, 0, pastDue);
                }

                // Calculate open balance
                const openBalanceIncluded: AgentBookingStatement[] = [];
                let runningBalance = 0;
                sortedStatements.forEach((element) => {
                    if (element.bookingNumber == 'PAST DUE') {
                        runningBalance += element.netAmount;
                        element.totalOpenBalance = runningBalance;
                    } else if (element.bookingNumber == 'PAYMENT') {
                        runningBalance -= element.netAmount;
                        element.totalOpenBalance = runningBalance;
                    } else if (element.paymentType != 'InvoiceLater') {
                        runningBalance +=
                            element.netAmount +
                            element.salesTaxOnNet +
                            element.feeOnNet -
                            (element.salesTax +
                                element.fee +
                                element.totalSalesAmount);
                        element.totalOpenBalance = runningBalance;
                    } else {
                        runningBalance +=
                            element.netAmount +
                            element.salesTaxOnNet +
                            element.feeOnNet;
                        element.totalOpenBalance = runningBalance;
                    }

                    openBalanceIncluded.push(element);
                });

                this.viewStatements$.next({
                    config: this.viewStatements$.getValue().config,
                    data: openBalanceIncluded,
                });

                return Promise.resolve();
            })
            .catch((error) => {
                this.uiState.openErrorDialog({
                    title: error.errorTitle
                        ? error.errorTitle
                        : ErrorDialogMessages.userManagement.loadUserError
                              .title,
                    description:
                        error?.errors &&
                        Array.isArray(error.errors) &&
                        error.errors.length > 0
                            ? error.errors[0]
                            : ErrorDialogMessages.userManagement.loadUserError
                                  .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .loadUserError.buttons.close,
                            isPrimary: true,
                            onClick: () => {
                                // do nothing
                            },
                        },
                    ],
                });
                this.viewStatus$.next('error');
                // swallow error
                return Promise.resolve();
            });
    }

    exportExcel(context?: {
        startDate: string;
        endDate: string;
        agentId: number;
        month: string;
        year: number;
    }): void {
        const filteredStatements = this.viewStatements$.getValue().data || [];

        const filteredStatementDetails = this.formatSummary(filteredStatements);

        // Extracting data with selected columns and mapping column names to object keys
        const formattedStatements = filteredStatements.map((row) => {
            return {
                'Booking Date':
                    new Date(row.bookingDateString).toLocaleDateString(
                        'en-US'
                    ) != 'Invalid Date'
                        ? new Date(row.bookingDateString).toLocaleDateString(
                              'en-US'
                          )
                        : '',
                'Order ID': row.reservationBookingId || row.bookingNumber || '',
                'Booking Number':
                    row.bookingNumber == 'PAYMENT' ||
                    row.bookingNumber == 'PAST DUE'
                        ? ''
                        : row.bookingNumber,
                Name:
                    row.firstName != null
                        ? row.firstName + ' ' + row.lastName
                        : '',
                Tour: row.tourName,
                'Invoice Total':
                    row.bookingNumber == 'PAYMENT' ||
                    row.bookingNumber == 'PAST DUE'
                        ? ''
                        : row.totalSalesAmount
                        ? this.cp.transform(
                              row.totalSalesAmount + row.salesTax + row.fee,
                              'USD',
                              'symbol',
                              '1.2-2'
                          )
                        : '',
                'Net Rate':
                    row.bookingNumber == 'PAYMENT' ||
                    row.bookingNumber == 'PAST DUE'
                        ? ''
                        : row.netAmount
                        ? this.cp.transform(
                              row.netAmount,
                              'USD',
                              'symbol',
                              '1.2-2'
                          )
                        : '',
                Taxes:
                    row.bookingNumber == 'PAYMENT' ||
                    row.bookingNumber == 'PAST DUE'
                        ? ''
                        : this.cp.transform(
                              row.salesTaxOnNet,
                              'USD',
                              'symbol',
                              '1.2-2'
                          ),
                Fees:
                    row.bookingNumber == 'PAYMENT' ||
                    row.bookingNumber == 'PAST DUE'
                        ? ''
                        : this.cp.transform(
                              row.feeOnNet,
                              'USD',
                              'symbol',
                              '1.2-2'
                          ),
                'Payment Type': row.paymentType,
                Due:
                    row.bookingNumber == 'PAYMENT'
                        ? ''
                        : this.cp.transform(
                              row.netAmount + row.salesTaxOnNet + row.feeOnNet,
                              'USD',
                              'symbol',
                              '1.2-2'
                          ),
                Credit:
                    row.paymentType != 'InvoiceLater' && row.paymentType != null
                        ? row.bookingNumber == 'PAYMENT'
                            ? '(' +
                              this.cp.transform(
                                  row.netAmount,
                                  'USD',
                                  'symbol',
                                  '1.2-2'
                              ) +
                              ')'
                            : '(' +
                              this.cp.transform(
                                  row.totalSalesAmount + row.salesTax + row.fee,
                                  'USD',
                                  'symbol',
                                  '1.2-2'
                              ) +
                              ')'
                        : '',
                'Open Balance': this.cp.transform(
                    row.totalOpenBalance,
                    'USD',
                    'symbol',
                    '1.2-2'
                ),
            };
        });

        // Blank entries for formatting
        const formattedStats = filteredStatementDetails
            ? [
                  [
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      'Previous Balance',
                      this.cp.transform(
                          filteredStatementDetails.previousBalance,
                          'USD',
                          'symbol',
                          '1.2-2'
                      ),
                  ],
                  [
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      'Total Sales',
                      this.cp.transform(
                          filteredStatementDetails.totalSales,
                          'USD',
                          'symbol',
                          '1.2-2'
                      ),
                  ],
                  [
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      'Total Payments',
                      this.cp.transform(
                          filteredStatementDetails.totalPayments,
                          'USD',
                          'symbol',
                          '1.2-2'
                      ),
                  ],
                  [
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      'Fees',
                      this.cp.transform(
                          filteredStatementDetails.fees,
                          'USD',
                          'symbol',
                          '1.2-2'
                      ),
                  ],
                  [
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      '',
                      'Total Due',
                      this.cp.transform(
                          filteredStatementDetails.totalDue,
                          'USD',
                          'symbol',
                          '1.2-2'
                      ),
                  ],
              ]
            : [['NO STATS']];

        const fomattedDateHeader = `${context?.month} ${context?.year}`;

        const worksheet = XLSX.utils.aoa_to_sheet([[fomattedDateHeader, '']]);

        // Add two empty rows between date and data table beginning
        for (let i = 0; i < 2; i++) {
            XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: -1 });
        }

        // Add Statements
        XLSX.utils.sheet_add_json(worksheet, formattedStatements, {
            origin: -1,
        });

        // Add two empty rows between data table and stats
        for (let i = 0; i < 2; i++) {
            XLSX.utils.sheet_add_aoa(worksheet, [[]], { origin: -1 });
        }

        // Add the stats
        XLSX.utils.sheet_add_aoa(worksheet, formattedStats, { origin: -1 });

        // Adjust the formatting of the columns
        worksheet['!cols'] = [
            { wch: 12 },
            { wch: 40 },
            { wch: 15 },
            { wch: 25 },
            { wch: 30 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 15 },
        ];

        const workbook = {
            Sheets: { data: worksheet },
            SheetNames: ['data'],
        };

        // Generating filename with timestamp
        const agentName =
            this.agentEditState.agentDetails$.getValue()?.uniqueName || '';
        const filename = `${agentName}_Statement_${context?.month}_${context?.year}.xlsx`;

        XLSX.writeFile(workbook, filename);
    }
}
