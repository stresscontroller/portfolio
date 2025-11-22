import { CommonModule, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Subject, distinctUntilChanged, filter, map, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import {
    AppAssignment,
    Features,
    OperatorFiltersState,
    UserState,
} from '@app/core';
import { PermissionDirective, TourInventoryTimePipe } from '@app/shared';
import { AssignmentsState, UIState } from '../../../state';
import { ModalTourDetailsComponent } from '../common';

@Component({
    standalone: true,
    selector: 'app-update-departure-time-modal',
    templateUrl: './update-departure-time.component.html',
    styleUrls: ['./update-departure-time.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        CalendarModule,
        DialogModule,
        TourInventoryTimePipe,
        ModalTourDetailsComponent,
        PermissionDirective,
    ],
})
export class UpdateDepartureTimeModalComponent {
    assignmentsState = inject(AssignmentsState);
    operatorFiltersState = inject(OperatorFiltersState);
    uiState = inject(UIState);
    userState = inject(UserState);
    departureForm = new FormGroup({
        departureTime: new FormControl<Date | null>(null, {
            validators: [Validators.required],
        }),
    });
    features = Features;

    updateDepartureTimeModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.updateDepartureTime),
        distinctUntilChanged()
    );

    isOpen$ = this.updateDepartureTimeModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.updateDepartureTimeModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = this.assignmentsState.status$.pipe(
        map((status) => status.updateDepartureTime)
    );
    private isDestroyed$ = new Subject<void>();
    ngAfterViewInit(): void {
        this.context$
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((context) => {
                if (context?.assignment) {
                    this.departureForm.patchValue(
                        {
                            departureTime: context.assignment
                                .actualDepartureTime
                                ? new Date(
                                      context.assignment.actualDepartureTime
                                  )
                                : null,
                        },
                        {
                            emitEvent: false,
                        }
                    );
                }
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    save(assignment?: AppAssignment): void {
        if (!assignment) {
            return;
        }
        if (this.departureForm.invalid) {
            Object.values(this.departureForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const userInfo = this.userState.aspNetUser$.getValue();
        if (!userInfo) {
            return;
        }

        const formValue = this.departureForm.getRawValue();
        if (!formValue.departureTime) {
            return;
        }
        const updatedDateTime = formatDate(
            formValue.departureTime,
            'yyyy-MM-ddTHH:mm:ss',
            'en-US'
        );
        if (!updatedDateTime) {
            return;
        }
        this.assignmentsState
            .updateActualDepartureTime(
                assignment.tourInventoryId,
                updatedDateTime
            )
            .then(() => {
                this.close();
                this.assignmentsState.resetIndividualStatus(
                    'updateDepartureTime'
                );
            });
    }

    close(): void {
        this.departureForm.reset();
        this.uiState.closeUpdateDepartureTimeModal();
    }
}
