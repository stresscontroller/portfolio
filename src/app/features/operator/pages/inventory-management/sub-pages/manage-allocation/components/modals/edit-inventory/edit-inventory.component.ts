import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { LoaderEmbedComponent } from '@app/shared';
import { UIState } from '../../../state';
import { AvailableInventoryTableComponent } from '../../tables/available-inventory-table/available-inventory-table.component';
import { ManageAllocationState } from '../../../state';
import { EditInventoryState } from './edit-inventory.state';
import { DeleteInventoryTableComponent } from '../../tables/delete-inventory-table/delete-inventory-table.component';
import { InventorySearchComponent } from './inventory-search/inventory-search.component';
import { InventoryUpdateComponent } from './inventory-update/inventory-update.component';

type Step = 'search' | 'update';

@Component({
    standalone: true,
    selector: 'app-edit-inventory-modal',
    templateUrl: './edit-inventory.component.html',
    styleUrls: ['./edit-inventory.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CheckboxModule,
        RadioButtonModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        DropdownModule,
        CalendarModule,
        AvailableInventoryTableComponent,
        DeleteInventoryTableComponent,
        LoaderEmbedComponent,
        InventorySearchComponent,
        InventoryUpdateComponent,
    ],
    providers: [EditInventoryState],
})
export class EditInventoryModalComponent {
    uiState = inject(UIState);
    editInventoryState = inject(EditInventoryState);
    manageAllocationState = inject(ManageAllocationState);

    editInventoryModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editInventory),
        distinctUntilChanged()
    );

    isOpen$ = this.editInventoryModal$.pipe(map((modal) => modal.isOpen));
    currentStep: Step = 'search';

    close(): void {
        this.currentStep = 'search';
        this.uiState.closeEditInventoryModal();
        this.editInventoryState.reset();
        this.manageAllocationState.reload();
    }

    updateStep(step: Step): void {
        this.currentStep = step;
    }
}
