import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { map } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { ManageService } from '../../manage.service';
import { CcIdentificationComponent } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-price-summary',
    templateUrl: './price-summary.component.html',
    styleUrls: ['./price-summary.component.scss'],
    imports: [CommonModule, CcIdentificationComponent, TooltipModule],
    providers: [CurrencyPipe],
})
export class PriceSummaryComponent {
    manageService = inject(ManageService);
    currencyPipe = inject(CurrencyPipe);

    accountType$ = this.manageService.booking$.pipe(
        map(
            (booking) =>
                booking?.[0]?.bookingDetails?.accountType.toLowerCase() ||
                undefined
        )
    );

    bookingAmountDetail$ = this.manageService.booking$.pipe(
        map((booking) => {
            let bookingAmountTotal = 0;
            let totalFees = 0;
            let totalTaxes = 0;
            if (booking && booking.length > 0) {
                booking.forEach((booking) => {
                    bookingAmountTotal +=
                        booking.bookingDetails.bookingAmountDetail
                            .bookingAmount;
                    totalFees += booking.bookingDetails.bookingAmountDetail.fee;
                    totalTaxes +=
                        booking.bookingDetails.bookingAmountDetail.tax;
                });
            }
            const feeString = this.currencyPipe.transform(
                totalFees || 0,
                'USD'
            );
            const taxString = this.currencyPipe.transform(
                totalTaxes || 0,
                'USD'
            );
            const costBreakdown = `Fees: ${feeString}\nTaxes: ${taxString}`;
            return {
                bookingAmountTotal,
                totalFees,
                totalTaxes,
                costBreakdown,
                totalCost:
                    booking?.[0]?.bookingDetails.bookingAmountDetail.totalCost,
            };
        })
    );
}
