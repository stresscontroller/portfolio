import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { MaintenanceTableComponent } from './components/maintenance-table/maintenance-table.component';
import { MaintenanceState } from './state';

@Component({
    standalone: true,
    selector: 'app-maintenance',
    templateUrl: './maintenance.component.html',
    styleUrls: ['./maintenance.component.scss'],
    imports: [
        CommonModule,
        LoaderEmbedComponent,
        PermissionDirective,
        MaintenanceTableComponent,
    ],
    providers: [MaintenanceState],
})
export class MaintenanceComponent {
    maintenance = inject(MaintenanceState);

    status$ = this.maintenance.status$;

    ngOnInit(): void {
        this.maintenance.init();
    }

    refresh(): void {
        this.maintenance.refresh();
    }
}
