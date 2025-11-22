import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AppAssignment, OperatorFiltersState, UIStatus } from '@app/core';
import { TourInventoryTimePipe } from '@app/shared';
import { AssignmentsState, UIState } from '../../../state';
import { ModalTourDetailsComponent } from '../common';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
    standalone: true,
    selector: 'app-update-status-modal',
    templateUrl: './update-status.component.html',
    styleUrls: ['./update-status.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RadioButtonModule,
        ButtonModule,
        DialogModule,
        InputTextareaModule,
        TourInventoryTimePipe,
        ModalTourDetailsComponent,
    ],
})
export class UpdateStatusModalComponent {
    assignmentState = inject(AssignmentsState);
    uiState = inject(UIState);
    operatorFiltersState = inject(OperatorFiltersState);

    tourStatusForm = new FormGroup({
        tourStatus: new FormControl<
            'open' | 'close' | 'unopened' | 'cancelled' | ''
        >('', [Validators.required]),
        cancellationReason: new FormControl<number | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
        cancellationReasonNotes: new FormControl<string>(''),
    });

    updateStatusModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.updateStatus),
        distinctUntilChanged()
    );

    isOpen$ = this.updateStatusModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.updateStatusModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    cancellationReasons$ =
        this.operatorFiltersState.tourInventoryCancellationReason$;

    displayCancelledForm$ =
        this.tourStatusForm.controls.tourStatus.valueChanges.pipe(
            map((tourStatus) => tourStatus === 'cancelled')
        );

    status$ = new BehaviorSubject<UIStatus>('idle');
    destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.operatorFiltersState.getTourInventoryCancellationReason();
        this.context$.pipe(takeUntil(this.destroyed$)).subscribe((context) => {
            this.status$.next('idle');
            if (context?.isCancelled) {
                this.tourStatusForm.patchValue({
                    tourStatus: 'cancelled',
                    cancellationReason: context.cancellationReason,
                    cancellationReasonNotes: context.specialNotes,
                });
            } else if (context?.isOpen) {
                this.tourStatusForm.patchValue({
                    tourStatus: 'open',
                });
            } else if (context?.isClosed) {
                this.tourStatusForm.patchValue({
                    tourStatus: 'close',
                });
            } else if (!context?.isOpen && !context?.isClosed) {
                this.tourStatusForm.patchValue({
                    tourStatus: 'unopened',
                });
            }
        });
        this.displayCancelledForm$
            .pipe(
                tap((displayCancelledForm) => {
                    this.tourStatusForm.controls.cancellationReason.reset();
                    this.tourStatusForm.controls.cancellationReasonNotes.reset();
                    if (displayCancelledForm) {
                        this.tourStatusForm.controls.cancellationReason.setValidators(
                            [Validators.required]
                        );
                    } else {
                        this.tourStatusForm.controls.cancellationReason.clearValidators();
                    }
                    this.tourStatusForm.controls.cancellationReason.updateValueAndValidity();
                    this.tourStatusForm.controls.cancellationReasonNotes.updateValueAndValidity();
                }),
                switchMap(() => {
                    return this.tourStatusForm.controls.cancellationReason.valueChanges.pipe(
                        tap((cancellationReason) => {
                            if (cancellationReason === 7) {
                                this.tourStatusForm.controls.cancellationReasonNotes.setValidators(
                                    [Validators.required]
                                );
                            } else {
                                this.tourStatusForm.controls.cancellationReasonNotes.clearValidators();
                            }
                            this.tourStatusForm.controls.cancellationReasonNotes.updateValueAndValidity();
                        })
                    );
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    save(assignment: AppAssignment): void {
        if (this.tourStatusForm.invalid) {
            Object.values(this.tourStatusForm.controls).forEach((control) => {
                control.markAsTouched();
                control.markAsDirty();
            });
            return;
        }
        const selectedTourStatus = this.tourStatusForm.getRawValue().tourStatus;
        this.status$.next('loading');
        Promise.resolve()
            .then(() => {
                if (selectedTourStatus === 'open') {
                    return this.openDeparture(assignment);
                } else if (selectedTourStatus === 'close') {
                    return this.closeDeparture(assignment);
                } else if (selectedTourStatus === 'unopened') {
                    return this.unopenDeparture(assignment);
                } else if (selectedTourStatus === 'cancelled') {
                    return this.cancelDeparture(assignment);
                }
                return Promise.reject('status not selected');
            })
            .then(() => {
                this.status$.next('success');
                this.assignmentState.refresh(true);
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeUpdateStatusModal();
    }

    private openDeparture(assignment: AppAssignment): Promise<void> {
        return Promise.resolve()
            .then(() => {
                if (assignment.isCancelled) {
                    return this.assignmentState
                        .revertCancelTourInventory(assignment.tourInventoryId)
                        .then(() => {});
                }
                return Promise.resolve();
            })
            .then(() => {
                return this.assignmentState.openDeparture(assignment);
            })
            .then(() => {
                return Promise.resolve();
            });
    }

    private closeDeparture(assignment: AppAssignment): Promise<void> {
        return Promise.resolve()
            .then(() => {
                if (assignment.isCancelled) {
                    return this.assignmentState
                        .revertCancelTourInventory(assignment.tourInventoryId)
                        .then(() => {});
                }
                return Promise.resolve();
            })
            .then(() => {
                return this.assignmentState.closeDeparture(assignment);
            })
            .then(() => {
                return Promise.resolve();
            });
    }

    private unopenDeparture(assignment: AppAssignment): Promise<void> {
        return Promise.resolve()
            .then(() => {
                if (assignment.isCancelled) {
                    return this.assignmentState
                        .revertCancelTourInventory(assignment.tourInventoryId)
                        .then(() => {});
                }
                return Promise.resolve();
            })
            .then(() => {
                return this.assignmentState.unopenDeparture(assignment);
            })
            .then(() => {
                return Promise.resolve();
            });
    }

    private cancelDeparture(assignment: AppAssignment): Promise<void> {
        const formValues = this.tourStatusForm.getRawValue();
        if (!formValues.cancellationReason) {
            return Promise.reject('missing cancellation reason');
        }
        return this.assignmentState
            .cancelTourInventory({
                tourInventoryId: assignment.tourInventoryId,
                cancellationReason: formValues.cancellationReason,
                cancellationReasonNotes:
                    formValues.cancellationReasonNotes || '',
            })
            .then(() => {
                return Promise.resolve();
            });
    }
}
