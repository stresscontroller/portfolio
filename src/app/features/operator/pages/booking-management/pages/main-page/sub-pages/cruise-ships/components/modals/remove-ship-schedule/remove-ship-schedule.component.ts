import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { CruiseShipScheduleListItem, UIStatus } from '@app/core';
import { CustomDatePipe } from '@app/shared';
import { CruiseShipsState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-remove-ship-schedule-modal',
    templateUrl: './remove-ship-schedule.component.html',
    styleUrls: ['./remove-ship-schedule.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        CustomDatePipe,
    ],
})
export class RemoveShipScheduleModalComponent {
    uiState = inject(UIState);
    cruiseShipsState = inject(CruiseShipsState);
    removeShipSchedule$ = this.uiState.modals$.pipe(
        map((modals) => modals.removeShipSchedule),
        distinctUntilChanged()
    );
    isOpen$ = this.removeShipSchedule$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeShipSchedule$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    remove(config: CruiseShipScheduleListItem): void {
        if (!config) {
            return;
        }
        this.status$.next('loading');
        this.cruiseShipsState
            .deleteShipSchedule(config.shipScheduleId, true)
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
        this.uiState.closeRemoveShipScheduleModal();
    }
}
