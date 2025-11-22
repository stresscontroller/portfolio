import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { CruiseLineListItem, UIStatus } from '@app/core';
import { CustomDatePipe } from '@app/shared';
import { CruiseLinesState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-remove-cruise-line-modal',
    templateUrl: './remove-cruise-line.component.html',
    styleUrls: ['./remove-cruise-line.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        CustomDatePipe,
    ],
})
export class RemoveCruiseLineModalComponent {
    uiState = inject(UIState);
    cruiseLinesState = inject(CruiseLinesState);
    removeCruiseLine$ = this.uiState.modals$.pipe(
        map((modals) => modals.removeCruiseLine),
        distinctUntilChanged()
    );
    isOpen$ = this.removeCruiseLine$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeCruiseLine$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    remove(config: CruiseLineListItem): void {
        if (!config) {
            return;
        }
        this.status$.next('loading');
        this.cruiseLinesState
            .deleteCruiseLine(config.shipCompanyId, false)
            .then(() => {
                this.status$.next('success');
                this.cruiseLinesState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeRemoveCruiseLineModal();
    }
}
