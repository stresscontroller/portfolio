import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { UserTrainingState, UIState } from '../../../state';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { UIStatus } from '@app/core';

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

    status$ = new BehaviorSubject<UIStatus>('idle');
    addUserTrainingModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.addTraining),
        distinctUntilChanged()
    );

    isOpen$ = this.addUserTrainingModal$.pipe(map((modal) => modal.isOpen));
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

    trainingOptions$ = this.userTrainingState.trainingOptions$;

    trainingCompletedOptions: TrainingComplete[] = [
        { active: 'True', value: true },
        { active: 'False', value: false },
    ];

    clear(): void {
        this.addUserTrainingForm.reset();
    }

    close(): void {
        this.status$.next('idle');
        this.clear();
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
        this.status$.next('loading');
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
                this.userTrainingState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
