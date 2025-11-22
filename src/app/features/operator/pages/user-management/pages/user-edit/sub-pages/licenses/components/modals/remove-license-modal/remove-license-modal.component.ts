import { Component, inject } from '@angular/core';
import { SpecialLicensesState, UIState } from '../../../state';
import { map, distinctUntilChanged, filter } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { UserQualificationListItem } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-remove-license-modal',
    templateUrl: './remove-license-modal.component.html',
    styleUrls: ['./remove-license-modal.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveLicenseModalComponent {
    uiState = inject(UIState);
    specialLicensesState = inject(SpecialLicensesState);
    removeFileModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteLicense),
        distinctUntilChanged()
    );

    isOpen$ = this.removeFileModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeFileModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    close() {
        this.uiState.closeRemoveLicenseModal();
    }

    delete(context: UserQualificationListItem) {
        this.specialLicensesState.deleteSpecialLicense(context).then(() => {
            this.close();
        });
    }
}
