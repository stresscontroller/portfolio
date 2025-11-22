import { Component, inject } from '@angular/core';
import { SalesReportState, UIState } from '../../../../state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { UIStatus } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-remove-file-report-header',
    templateUrl: './remove-file-report-header.component.html',
    styleUrls: ['./remove-file-report-header.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveFileReportHeaderComponent {
    uiState = inject(UIState);
    salesReportState = inject(SalesReportState);
    removeFileModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteReport),
        distinctUntilChanged()
    );

    isOpen$ = this.removeFileModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeFileModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    close(): void {
        this.uiState.closeRemoveFileReportModal();
    }
    delete(context: number): void {
        this.status$.next('loading');
        this.salesReportState
            .deleteShipCompanyFileHeaderTextMap(context)
            .then(() => {
                this.status$.next('idle');
                this.salesReportState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
