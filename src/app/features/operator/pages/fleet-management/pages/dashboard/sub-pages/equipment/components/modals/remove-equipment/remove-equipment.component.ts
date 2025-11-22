import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, distinctUntilChanged, filter } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { EquipmentListItem } from '@app/core';
import { CustomDatePipe } from '@app/shared';
import { EquipmentsState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-remove-equipment-modal',
    templateUrl: './remove-equipment.component.html',
    styleUrls: ['./remove-equipment.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        CustomDatePipe,
    ],
})
export class RemoveEquipmentModalComponent {
    uiState = inject(UIState);
    equipmentsState = inject(EquipmentsState);
    removeEquipment$ = this.uiState.modals$.pipe(
        map((modals) => modals.removeEquipment),
        distinctUntilChanged()
    );
    isOpen$ = this.removeEquipment$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeEquipment$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = this.equipmentsState.status$;

    remove(config: EquipmentListItem): void {
        if (!config) {
            return;
        }
        this.equipmentsState
            .deleteEquipment(config.equipmentID, false)
            .then(() => {
                this.close();
            });
    }

    close(): void {
        this.uiState.closeRemoveEquipmentModal();
    }
}
