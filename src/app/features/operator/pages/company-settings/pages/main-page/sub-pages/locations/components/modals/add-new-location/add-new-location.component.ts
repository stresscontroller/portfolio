import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';

import { UIStatus } from '@app/core';
import { UIState, LocationsState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-add-new-location-modal',
    templateUrl: './add-new-location.component.html',
    styleUrls: ['./add-new-location.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        InputTextModule,
    ],
})
export class AddNewLocationModalComponent {
    uiState = inject(UIState);
    locationsState = inject(LocationsState);
    addNewLocation$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewLocation),
        distinctUntilChanged()
    );
    isOpen$ = this.addNewLocation$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    locationType$ = this.locationsState.locationType$;
    addNewLocationForm = new FormGroup({
        locationName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        locationType: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
    });

    close(): void {
        this.status$.next('idle');
        this.uiState.closeAddNewLocationModal();
    }
}
