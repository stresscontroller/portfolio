import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { CruiseShipListItem, UIStatus } from '@app/core';
import { CustomDatePipe } from '@app/shared';
import { CruiseShipsState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-remove-cruise-ship-modal',
    templateUrl: './remove-cruise-ship.component.html',
    styleUrls: ['./remove-cruise-ship.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        CustomDatePipe,
    ],
})
export class RemoveCruiseShipModalComponent {
    uiState = inject(UIState);
    cruiseShipsState = inject(CruiseShipsState);
    removeCruiseShip$ = this.uiState.modals$.pipe(
        map((modals) => modals.removeCruiseShip),
        distinctUntilChanged()
    );
    isOpen$ = this.removeCruiseShip$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeCruiseShip$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    remove(config: CruiseShipListItem): void {
        if (!config) {
            return;
        }
        this.status$.next('loading');
        this.cruiseShipsState
            .deleteCruiseShip(config.shipId, false)
            .then(() => {
                this.status$.next('success');
                this.cruiseShipsState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeRemoveCruiseShipModal();
    }
}
