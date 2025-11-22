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
    selector: 'app-restore-equipment-modal',
    templateUrl: './restore-equipment.component.html',
    styleUrls: ['./restore-equipment.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        CustomDatePipe,
    ],
})
export class RestoreEquipmentModalComponent {
    uiState = inject(UIState);
    equipmentsState = inject(EquipmentsState);
    restoreEquipment$ = this.uiState.modals$.pipe(
        map((modals) => modals.restoreEquipment),
        distinctUntilChanged()
    );
    isOpen$ = this.restoreEquipment$.pipe(map((modal) => modal.isOpen));
    context$ = this.restoreEquipment$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = this.equipmentsState.status$;

    restore(config: EquipmentListItem): void {
        if (!config) {
            return;
        }
        this.equipmentsState
            .deleteEquipment(config.equipmentID, true)
            .then(() => {
                this.close();
            });
    }

    close(): void {
        this.uiState.closeRestoreEquipmentModal();
    }
}
