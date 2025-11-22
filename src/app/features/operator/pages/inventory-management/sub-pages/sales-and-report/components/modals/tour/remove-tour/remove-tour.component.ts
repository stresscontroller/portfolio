import { Component, inject } from '@angular/core';
import { SalesReportState, UIState } from '../../../../state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TourMapsItem, UIStatus } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-remove-tour',
    templateUrl: './remove-tour.component.html',
    styleUrls: ['./remove-tour.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveTourComponent {
    uiState = inject(UIState);
    salesReportState = inject(SalesReportState);
    removeTourModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteTour),
        distinctUntilChanged()
    );

    isOpen$ = this.removeTourModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeTourModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    close(): void {
        this.uiState.closeRemoveTourModal();
    }

    delete(context: TourMapsItem) {
        this.status$.next('loading');
        this.salesReportState
            .deleteShipCompanyTourMap(context)
            .then(() => {
                this.close();
                this.status$.next('idle');
                this.salesReportState.refresh();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
