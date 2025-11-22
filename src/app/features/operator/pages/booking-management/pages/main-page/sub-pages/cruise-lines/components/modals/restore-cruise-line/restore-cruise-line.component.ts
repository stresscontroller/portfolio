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
    selector: 'app-restore-cruise-line-modal',
    templateUrl: './restore-cruise-line.component.html',
    styleUrls: ['./restore-cruise-line.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        CustomDatePipe,
    ],
})
export class RestoreCruiseLineModalComponent {
    uiState = inject(UIState);
    CruiseLinesState = inject(CruiseLinesState);
    restoreCruiseLine$ = this.uiState.modals$.pipe(
        map((modals) => modals.restoreCruiseLine),
        distinctUntilChanged()
    );
    isOpen$ = this.restoreCruiseLine$.pipe(map((modal) => modal.isOpen));
    context$ = this.restoreCruiseLine$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    restore(config: CruiseLineListItem): void {
        if (!config) {
            return;
        }
        this.status$.next('loading');
        this.CruiseLinesState.deleteCruiseLine(config.shipCompanyId, true)
            .then(() => {
                this.status$.next('success');
                this.CruiseLinesState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeRestoreCruiseLineModal();
    }
}
