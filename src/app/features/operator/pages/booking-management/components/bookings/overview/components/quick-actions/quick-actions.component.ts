import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { PermissionConfig, PermissionDirective } from '@app/shared';
import { OverviewService } from '../../overview.service';

@Component({
    standalone: true,
    selector: 'app-quick-actions',
    templateUrl: './quick-actions.component.html',
    styleUrls: ['./quick-actions.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        InputSwitchModule,
        ButtonModule,
        PermissionDirective,
    ],
})
export class QuickActionsComponent {
    @Input() exportPermission?: PermissionConfig;
    overviewService = inject(OverviewService);
    displayIsActive$ = this.overviewService.isActiveFilter$;
    quickSearchText = '';

    toggleDisplayIsActive(): void {
        this.overviewService.setIsActiveFilter(
            !this.displayIsActive$.getValue()
        );
    }

    onSearchTextChange(text: string): void {
        this.overviewService.updateQuickSearch(text);
    }

    onExport(): void {
        this.overviewService.exportExcel();
    }
}
