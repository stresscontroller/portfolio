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
    selector: 'app-restore-cruise-ship-modal',
    templateUrl: './restore-cruise-ship.component.html',
    styleUrls: ['./restore-cruise-ship.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        CustomDatePipe,
    ],
})
export class RestoreCruiseShipModalComponent {
    uiState = inject(UIState);
    cruiseShipsState = inject(CruiseShipsState);
    restoreCruiseShip$ = this.uiState.modals$.pipe(
        map((modals) => modals.restoreCruiseShip),
        distinctUntilChanged()
    );
    isOpen$ = this.restoreCruiseShip$.pipe(map((modal) => modal.isOpen));
    context$ = this.restoreCruiseShip$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    restore(config: CruiseShipListItem): void {
        if (!config) {
            return;
        }
        this.status$.next('loading');
        this.cruiseShipsState
            .deleteCruiseShip(config.shipId, true)
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
        this.uiState.closeRestoreCruiseShipModal();
    }
}
