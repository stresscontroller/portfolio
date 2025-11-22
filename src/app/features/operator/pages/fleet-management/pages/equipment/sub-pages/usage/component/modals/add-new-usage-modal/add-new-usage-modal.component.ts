import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { UIState } from '../../../state';
import { map, distinctUntilChanged, BehaviorSubject, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { UIStatus } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-add-new-usage-modal',
    templateUrl: './add-new-usage-modal.component.html',
    styleUrls: ['./add-new-usage-modal.component.scss'],
    imports: [
        ReactiveFormsModule,
        DialogModule,
        CommonModule,
        DividerModule,
        DropdownModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        InputTextModule,
        InputTextareaModule,
    ],
})
export class AddNewUsageModalComponent {
    uiState = inject(UIState);
    formBuilder = inject(FormBuilder);

    addNewUsage$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewUsage),
        distinctUntilChanged()
    );
    isOpen$ = this.addNewUsage$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    private destroyed$ = new Subject<void>();
    addNewUsageForm = new FormGroup({});

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeAddNewUsageModal();
    }

    save(): void {
        // if (this.addNewUsageForm.invalid) {
        //     Object.values(this.addNewUsageForm.controls).forEach((control) => {
        //         control.markAsDirty();
        //         control.markAsTouched();
        //     });
        //     return;
        // }
    }
}
