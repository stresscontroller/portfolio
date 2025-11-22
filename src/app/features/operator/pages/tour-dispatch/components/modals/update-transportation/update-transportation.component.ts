import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, distinctUntilChanged, filter, map, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
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
    selector: 'app-update-transportation-modal',
    templateUrl: './update-transportation.component.html',
    styleUrls: ['./update-transportation.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DropdownModule,
        ButtonModule,
        DialogModule,
        TourInventoryTimePipe,
        ModalTourDetailsComponent,
        PermissionDirective,
    ],
})
export class UpdateTransportationModalComponent {
    assignmentsState = inject(AssignmentsState);
    operatorFiltersState = inject(OperatorFiltersState);
    uiState = inject(UIState);
    userState = inject(UserState);
    transportationForm = new FormGroup({
        guideId: new FormControl<number | null>(null),
        transportationId: new FormControl<number | null>(null),
    });
    features = Features;

    updateTransportationModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.updateTransportation),
        distinctUntilChanged()
    );

    isOpen$ = this.updateTransportationModal$.pipe(
        map((modal) => modal.isOpen)
    );
    context$ = this.updateTransportationModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    guides$ = this.operatorFiltersState.guides$;
    equipments$ = this.operatorFiltersState.equipmentList$.pipe(
        map((equipments) => {
            return equipments
                ?.map((equipment) => {
                    return {
                        ...equipment,
                        displayName: `${equipment.equipmentNumber} - ${equipment.equipmentType} `,
                    };
                })
                .sort((a, b) => Number(a.equipmentID) - Number(b.equipmentID));
        })
    );
    status$ = this.assignmentsState.status$.pipe(
        map((status) => status.updateGuideAndTransportation)
    );
    private isDestroyed$ = new Subject<void>();
    ngAfterViewInit(): void {
        this.operatorFiltersState.getEquipmentList();
        this.operatorFiltersState.getGuides();
        this.context$
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((context) => {
                if (context?.assignment) {
                    this.transportationForm.patchValue(
                        {
                            guideId: context.assignment.dtdAssignmentGuideId,
                            transportationId:
                                context.assignment
                                    .dtdAssignmentTransportationId,
                        },
                        {
                            emitEvent: false,
                        }
                    );
                }
            });
        this.transportationForm.controls.guideId.valueChanges
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((guideId) => {
                if (
                    guideId &&
                    !this.transportationForm.value.transportationId
                ) {
                    // auto select from saved preference within the session
                    const transportationId =
                        this.assignmentsState.sessionPreferences
                            .driverTransportationMapping[guideId];
                    if (transportationId) {
                        this.transportationForm.patchValue({
                            transportationId,
                        });
                    }
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
        if (this.transportationForm.invalid) {
            Object.values(this.transportationForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const userInfo = this.userState.aspNetUser$.getValue();
        if (!userInfo) {
            return;
        }
        const formValue = this.transportationForm.getRawValue();
        this.assignmentsState
            .updateGuideAndTransportation(
                {
                    tourInventoryId: assignment.tourInventoryId,
                    actualAdults: assignment.actualAdults,
                    actualChildren: assignment.actualChildren,
                    specialNotes: assignment.specialNotes || '',
                    cruiseLineEscorts: assignment.cruiseLineEscorts,
                    payingAdditionalGuests: assignment.payingAdditionalGuests,
                    isClosed: assignment.isClosed ? true : false,
                    dtdAssignmentGuideId: assignment.dtdAssignmentGuideId,
                    final: assignment.final,
                    isOpen: assignment.isOpen,
                    createdBy: '',
                    equipmentNumber: assignment.equipmentNumber,
                    dtdAssignmentTransportationId:
                        assignment.dtdAssignmentTransportationId,
                    isFinalOnlyUpdate: false,
                },
                formValue.guideId,
                formValue.transportationId
            )
            .then(() => {
                this.close();
                this.assignmentsState.resetIndividualStatus(
                    'updateGuideAndTransportation'
                );
            });
    }

    close(): void {
        this.transportationForm.reset();
        this.uiState.closeUpdateTransportationModal();
    }
}
