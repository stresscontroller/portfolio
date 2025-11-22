import { Component, inject } from '@angular/core';
import { EquipmentTypeState, UIState } from '../../../state';
import { map, distinctUntilChanged, filter } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { EquipmentTypeListItem } from '@app/core';
@Component({
    standalone: true,
    selector: 'app-restore-equipment-type-modal',
    templateUrl: './restore-equipment-type.component.html',
    styleUrls: ['./restore-equipment-type.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RestoreEquipmentTypeModalComponent {
    uiState = inject(UIState);
    equipmentTypeState = inject(EquipmentTypeState);
    restoreEquipmentType$ = this.uiState.modals$.pipe(
        map((modals) => modals.restoreEquipmentType),
        distinctUntilChanged()
    );

    isOpen$ = this.restoreEquipmentType$.pipe(map((modal) => modal.isOpen));
    context$ = this.restoreEquipmentType$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    appliedFilters$ = this.restoreEquipmentType$.pipe(
        map((data) => data.context)
    );
    status$ = this.equipmentTypeState.status$;

    close() {
        this.uiState.closeRestoreEquipmentTypeModal();
    }

    restore(config: EquipmentTypeListItem) {
        this.equipmentTypeState
            .deleteEquipmentType(config.equipmentTypeID, true)
            .then(() => {
                this.close();
            });
    }
}
