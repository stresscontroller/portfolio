import { Component, inject } from '@angular/core';
import { SalesReportState, UIState } from '../../../../state';
import { map, distinctUntilChanged, filter } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { PortMapsItem } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-remove-port',
    templateUrl: './remove-port.component.html',
    styleUrls: ['./remove-port.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemovePortComponent {
    uiState = inject(UIState);
    salesReportState = inject(SalesReportState);
    removePortModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deletePort),
        distinctUntilChanged()
    );

    isOpen$ = this.removePortModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.removePortModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    close(): void {
        this.uiState.closeRemovePortModal();
    }

    delete(context: PortMapsItem): void {
        this.salesReportState.deleteShipCompanyPortMap(context).then(() => {
            this.close();
            this.salesReportState.refresh();
        });
    }
}
