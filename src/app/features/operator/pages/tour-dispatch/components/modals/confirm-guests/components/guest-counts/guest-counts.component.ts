import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';
import {
    ApiTourInventoryDTDAssignmentModel,
    AppAssignment,
    UIStatus,
    UserState,
} from '@app/core';
import { TourInventoryTimePipe } from '@app/shared';
import { AssignmentsState, UIState } from '../../../../../state';
import { ModalTourDetailsComponent } from '../../../common';

@Component({
    standalone: true,
    selector: 'app-guest-counts',
    templateUrl: './guest-counts.component.html',
    styleUrls: ['./guest-counts.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        InputTextModule,
        ButtonModule,
        DividerModule,
        InputTextareaModule,
        CheckboxModule,
        TourInventoryTimePipe,
        ModalTourDetailsComponent,
    ],
})
export class GuestCountsComponent {
    @Input() set assignment(value: AppAssignment | null | undefined) {
        this.selectedAssignment = value || undefined;
        this.specialNotes = this.replaceQuotes(value?.specialNotes ?? '');
    }
    @Input() tourDate: Date | null | undefined;
    @Input() displayNotesSection: boolean = false;
    @Input() set guestCounts(
        value: ApiTourInventoryDTDAssignmentModel | null | undefined
    ) {
        this.saveNotesStatus$.next('idle');
        if (value) {
            this.confirmGuestsForm.reset({
                actualAdults: value.actualAdults,
                actualChildren: value.actualChildren,
                cruiseLineEscorts: value.cruiseLineEscorts || null,
                payingAdditionalGuests: value.payingAdditionalGuests || null,
                notes: value.specialNotes || '',
            });
        } else {
            this.confirmGuestsForm.reset();
        }
    }
    @Output() next = new EventEmitter<ApiTourInventoryDTDAssignmentModel>();
    @Output() cancel = new EventEmitter<void>();

    selectedAssignment: AppAssignment | undefined = undefined;
    assignmentsState = inject(AssignmentsState);
    uiState = inject(UIState);
    userState = inject(UserState);

    replaceQuotes(input: string): string {
        return input.replace(/&quot;/g, '"');
    }

    totalPassengersValidator = (editableFieldsFormControl: AbstractControl) => {
        const adultsForm = editableFieldsFormControl.get('actualAdults');
        const childrenForm = editableFieldsFormControl.get('actualChildren');
        if (!adultsForm || !childrenForm) {
            return null;
        }
        let error = null;
        if (
            (adultsForm.dirty || childrenForm.dirty) &&
            adultsForm.value === null &&
            childrenForm.value === null
        ) {
            error = { totalPassengersIsNull: true };
        }

        // mark both fields as dirty so we can display the red error border
        adultsForm.markAsDirty();
        adultsForm.setErrors(error);
        childrenForm.markAsDirty();
        childrenForm.setErrors(error);
        return error;
    };

    confirmGuestsForm = new FormGroup(
        {
            actualAdults: new FormControl<null | number>(null),
            actualChildren: new FormControl<null | number>(null),
            cruiseLineEscorts: new FormControl(0),
            payingAdditionalGuests: new FormControl(0),
            notes: new FormControl('', [Validators.maxLength(500)]),
        },
        {
            validators: this.totalPassengersValidator,
        }
    );

    saveNotesStatus$ = new BehaviorSubject<UIStatus>('idle');
    specialNotes = '';

    saveNotes(): void {
        if (!this.selectedAssignment) {
            return;
        }
        this.saveNotesStatus$.next('loading');
        this.assignmentsState
            .updateSpecialNotes({
                tourInventoryId: this.selectedAssignment.tourInventoryId,
                specialNotes: this.specialNotes || '',
                createdBy: '',
            })
            .then(() => {
                this.saveNotesStatus$.next('success');
            })
            .catch(() => {
                this.saveNotesStatus$.next('error');
            });
    }

    save(): void {
        if (
            !this.selectedAssignment ||
            !this.selectedAssignment.tourInventoryId
        ) {
            return;
        }
        if (!this.confirmGuestsForm.valid) {
            Object.values(this.confirmGuestsForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                }
            );
            return;
        }
        const userInfo = this.userState.aspNetUser$.getValue();
        if (!userInfo) {
            return;
        }
        this.saveNotesStatus$.next('idle');
        const formValues = this.confirmGuestsForm.getRawValue();
        this.next.emit({
            actualAdults: formValues.actualAdults || 0,
            actualChildren: formValues.actualChildren || 0,
            cruiseLineEscorts: formValues.cruiseLineEscorts || 0,
            payingAdditionalGuests: formValues.payingAdditionalGuests || 0,
            final:
                (formValues.actualAdults || 0) +
                (formValues.actualChildren || 0) +
                (formValues.cruiseLineEscorts || 0) +
                (formValues.payingAdditionalGuests || 0),
            isFinalOnlyUpdate: false,
            specialNotes: formValues.notes || '',
            tourInventoryId: this.selectedAssignment.tourInventoryId,
            dtdAssignmentGuideId:
                this.selectedAssignment.dtdAssignmentGuideId || 0,
            createdBy: userInfo.b2CUserId || '',
            equipmentNumber: this.selectedAssignment.equipmentNumber || 0,
            dtdAssignmentTransportationId:
                this.selectedAssignment.dtdAssignmentTransportationId || null,
        });
    }

    onCancel(): void {
        this.saveNotesStatus$.next('idle');
        this.cancel.emit();
    }
}
