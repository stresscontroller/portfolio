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
    selector: 'app-remove-equipment-type-modal',
    templateUrl: './remove-equipment-type.component.html',
    styleUrls: ['./remove-equipment-type.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveEquipmentTypeModalComponent {
    uiState = inject(UIState);
    equipmentTypeState = inject(EquipmentTypeState);
    removeEquipmentType$ = this.uiState.modals$.pipe(
        map((modals) => modals.removeEquipmentType),
        distinctUntilChanged()
    );

    isOpen$ = this.removeEquipmentType$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeEquipmentType$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    appliedFilters$ = this.removeEquipmentType$.pipe(
        map((data) => data.context)
    );
    status$ = this.equipmentTypeState.status$;

    close() {
        this.uiState.closeRemoveEquipmentTypeModal();
    }

    remove(config: EquipmentTypeListItem) {
        this.equipmentTypeState
            .deleteEquipmentType(config.equipmentTypeID, false)
            .then(() => {
                this.close();
            });
    }
}
