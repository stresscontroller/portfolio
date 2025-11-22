import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { UsageTableComponent } from './component/usage-table/usage-table.component';
import { UsageState } from './state';
@Component({
    standalone: true,
    selector: 'app-usage',
    templateUrl: './usage.component.html',
    styleUrls: ['./usage.component.scss'],
    imports: [
        CommonModule,
        LoaderEmbedComponent,
        PermissionDirective,
        UsageTableComponent,
    ],
    providers: [UsageState],
})
export class UsageComponent {
    usageState = inject(UsageState);

    status$ = this.usageState.status$;

    ngOnInit(): void {
        this.usageState.init();
    }

    refresh(): void {
        this.usageState.refresh();
    }
}
