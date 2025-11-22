import { Component, inject } from '@angular/core';
import { SalesReportState, UIState } from '../../../../state';
import { map, distinctUntilChanged, filter } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { ShipCompanyShipMapsItem } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-remove-ship',
    templateUrl: './remove-ship.component.html',
    styleUrls: ['./remove-ship.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveShipComponent {
    uiState = inject(UIState);
    salesReportState = inject(SalesReportState);
    removeShipModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteShip),
        distinctUntilChanged()
    );

    isOpen$ = this.removeShipModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeShipModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    close(): void {
        this.uiState.closeRemoveShipModal();
    }

    delete(context: ShipCompanyShipMapsItem): void {
        this.salesReportState.deleteShipCompanyShipMap(context).then(() => {
            this.close();
            this.salesReportState.refresh();
        });
    }
}
