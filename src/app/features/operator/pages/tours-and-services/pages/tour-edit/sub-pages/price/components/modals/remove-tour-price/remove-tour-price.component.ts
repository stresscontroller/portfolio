import { Component, inject } from '@angular/core';
import { UIState, TourPriceState } from '../../../state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TourPriceDetails, UIStatus } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-remove-tour-price-modal',
    templateUrl: './remove-tour-price.component.html',
    styleUrls: ['./remove-tour-price.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveTourPriceModalComponent {
    uiState = inject(UIState);
    tourPriceState = inject(TourPriceState);
    removeTourPrice$ = this.uiState.modals$.pipe(
        map((modals) => modals.removeTourPrice),
        distinctUntilChanged()
    );

    status$ = new BehaviorSubject<UIStatus>('idle');

    isOpen$ = this.removeTourPrice$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeTourPrice$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    close(): void {
        this.status$.next('idle');
        this.uiState.closeRemoveTourPriceModal();
    }
    delete(config: TourPriceDetails): void {
        this.status$.next('loading');
        this.tourPriceState
            .deleteTourPrice(config)
            .then(() => {
                this.status$.next('success');
                this.tourPriceState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
