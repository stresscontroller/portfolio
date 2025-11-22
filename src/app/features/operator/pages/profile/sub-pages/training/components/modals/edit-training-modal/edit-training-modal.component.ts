import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';

import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { UserTrainingState, UIState } from '../../../state';
import {
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    map,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { UIStatus, adjustDate } from '@app/core';

interface TrainingComplete {
    active: string;
    value: boolean;
}

@Component({
    standalone: true,
    selector: 'app-edit-training-modal',
    templateUrl: './edit-training-modal.component.html',
    styleUrls: ['./edit-training-modal.component.scss'],
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
export class EditTrainingModalComponent {
    uiState = inject(UIState);
    userTrainingState = inject(UserTrainingState);

    status$ = new BehaviorSubject<UIStatus>('idle');

    editUserTrainingModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editTraining),
        distinctUntilChanged()
    );

    isOpen$ = this.editUserTrainingModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.editUserTrainingModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    editUserTrainingForm = new FormGroup({
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

    training$ = this.editUserTrainingModal$.pipe(map((data) => data.context));
    private userTrainingId: number | undefined = undefined;

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setupForm();
    }

    clear(): void {
        this.editUserTrainingForm.reset();
    }

    close(): void {
        this.status$.next('idle');
        this.clear();
        this.uiState.closeEditTrainingModal();
    }

    save(): void {
        if (this.editUserTrainingForm.invalid) {
            Object.values(this.editUserTrainingForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        this.status$.next('loading');
        const formValues = this.editUserTrainingForm.getRawValue();
        this.userTrainingState
            .saveTraining({
                userTrainingId: this.userTrainingId ?? 0,
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
                companyUniqueId: '',
                userId: '',
            })
            .then(() => {
                this.userTrainingState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    private setupForm(): void {
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return this.training$.pipe(
                        distinctUntilChanged((prev, curr) => {
                            return (
                                JSON.stringify(prev) === JSON.stringify(curr)
                            );
                        }),
                        takeUntil(this.destroyed$)
                    );
                })
            )
            .subscribe((training) => {
                if (training) {
                    this.userTrainingId = training.userTrainingId;
                    this.editUserTrainingForm.patchValue({
                        trainingName: training.trainingId,
                        trainingCompleted: training.trainingCompleted,
                        completionDate: training.completionDate
                            ? adjustDate(new Date(training.completionDate))
                            : new Date(),
                    });
                } else {
                    this.userTrainingId = undefined;
                }
            });
    }
}
