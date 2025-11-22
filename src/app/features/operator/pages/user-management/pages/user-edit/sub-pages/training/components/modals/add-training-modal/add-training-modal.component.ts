import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { UserTrainingState, UIState } from '../../../state';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';

interface TrainingComplete {
    active: string;
    value: boolean;
}

@Component({
    standalone: true,
    selector: 'app-add-training-modal',
    templateUrl: './add-training-modal.component.html',
    styleUrls: ['./add-training-modal.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        DropdownModule,
        CalendarModule,
    ],
})
export class AddTrainingModalComponent {
    uiState = inject(UIState);
    userTrainingState = inject(UserTrainingState);

    status$ = this.userTrainingState.status$.pipe(map((status) => status.save));

    addUserTrainingModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.addTraining),
        distinctUntilChanged()
    );

    isOpen$ = this.addUserTrainingModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.addUserTrainingModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    addUserTrainingForm = new FormGroup({
        trainingName: new FormControl<number | null>(null, [
            Validators.required,
        ]),
        completionDate: new FormControl<Date | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
        trainingCompleted: new FormControl<boolean | null>(null, [
            Validators.required,
        ]),
    });

    trainingList$ = this.userTrainingState.trainingList$;

    trainingCompletedOptions: TrainingComplete[] = [
        { active: 'True', value: true },
        { active: 'False', value: false },
    ];

    appliedFilters$ = this.addUserTrainingModal$.pipe(
        map((data) => data.context)
    );

    clear(): void {
        this.addUserTrainingForm.reset();
    }

    close() {
        this.uiState.closeAddTrainingModal();
    }

    save(): void {
        if (this.addUserTrainingForm.invalid) {
            Object.values(this.addUserTrainingForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.addUserTrainingForm.getRawValue();
        this.userTrainingState
            .saveTraining({
                userTrainingId: 0,
                trainingId: formValues.trainingName ?? 0,
                completionDate: formValues.completionDate
                    ? formatDate(
                          new Date(formValues.completionDate),
                          'YYYY-MM-dd',
                          'en-US'
                      )
                    : '',
                trainingCompleted: formValues.trainingCompleted ?? false,
                trainingName: '',
                isActive: true,
                userId: '',
                companyUniqueId: '',
            })
            .then(() => {
                this.clear();
                this.close();
            });
    }
}
