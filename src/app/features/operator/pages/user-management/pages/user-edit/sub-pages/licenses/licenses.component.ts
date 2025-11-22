import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { map } from 'rxjs';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { Features } from '@app/core';
import {
    SpecialLicensesTableComponent,
    AddLicenseModalComponent,
    EditLicenseModalComponent,
    RemoveLicenseModalComponent,
} from './components';
import { UIState, SpecialLicensesState } from './state';

@Component({
    standalone: true,
    selector: 'app-licenses',
    templateUrl: './licenses.component.html',
    styleUrls: ['./licenses.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        DropdownModule,
        LoaderEmbedComponent,
        SpecialLicensesTableComponent,
        AddLicenseModalComponent,
        EditLicenseModalComponent,
        RemoveLicenseModalComponent,
        PermissionDirective,
    ],
    providers: [UIState, SpecialLicensesState],
})
export class LicensesComponent {
    features = Features;
    uiState = inject(UIState);
    specialLicensesState = inject(SpecialLicensesState);

    status$ = this.specialLicensesState.status$.pipe(
        map((status) => status.loadLicenses)
    );
    licenses$ = this.specialLicensesState.licenses$;
    qualifications$ = this.specialLicensesState.qualifications$;

    ngOnInit(): void {
        this.specialLicensesState.init();
    }

    refresh(): void {
        this.specialLicensesState.refresh();
    }

    openAddLicenseModal() {
        this.uiState.openAddLicenseModal();
    }
}
