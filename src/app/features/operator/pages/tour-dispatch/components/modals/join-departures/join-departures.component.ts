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
    takeUntil,
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AppAssignment, Features, UIStatus } from '@app/core';
import { AssignmentsState, UIState } from '../../../state';
import { ModalTourDetailsComponent } from '../common';
import { PermissionDirective } from '@app/shared';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    standalone: true,
    selector: 'app-join-departures-modal',
    templateUrl: './join-departures.component.html',
    styleUrls: ['./join-departures.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextareaModule,
        InputTextModule,
        DropdownModule,
        ButtonModule,
        DialogModule,
        ModalTourDetailsComponent,
        PermissionDirective,
    ],
})
export class JoinDeparturesModalComponent {
    assignmentsState = inject(AssignmentsState);
    uiState = inject(UIState);
    features = Features;

    joinDeparturesModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.joinDepartures),
        distinctUntilChanged()
    );

    isOpen$ = this.joinDeparturesModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.joinDeparturesModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    status$ = new BehaviorSubject<UIStatus>('idle');
    tourOptions$ = this.context$.pipe(
        map((context) => {
            if (!context?.allAssignments || !context.assignment) {
                return [];
            }
            return context.allAssignments
                .filter((assignment) => {
                    return (
                        assignment.tourId === context.assignment.tourId &&
                        assignment.tourInventoryId !==
                            context.assignment.tourInventoryId
                    );
                })
                .map((assignment) => ({
                    displayName: `${assignment.tourTime} - ${assignment.shipName} (${assignment.total}/${assignment.tourInventoryAllocatedSeats})`,
                    tourInventoryId: assignment.tourInventoryId,
                }));
        })
    );

    joinDeparturesForm = new FormGroup({
        tourInventoryToId: new FormControl<number | null>(null, [
            Validators.required,
        ]),
        guestCounts: new FormControl<number | null>(null, [
            Validators.required,
        ]),
        notes: new FormControl<string>(''),
    });

    private isDestroyed$ = new Subject<void>();

    ngAfterViewInit(): void {
        this.context$.pipe(takeUntil(this.isDestroyed$)).subscribe(() => {
            this.status$.next('idle');
            this.joinDeparturesForm.reset();
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
        this.status$.next('loading');
        const currentTourInventoryId = assignment?.tourInventoryId;
        if (!currentTourInventoryId) {
            return;
        }

        if (this.joinDeparturesForm.invalid) {
            Object.values(this.joinDeparturesForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.joinDeparturesForm.getRawValue();
        this.assignmentsState
            .joinDepartures({
                tourInventoryFromId: currentTourInventoryId,
                tourInventoryToId: formValues.tourInventoryToId!,
                guestCounts: formValues.guestCounts!,
                notes: formValues.notes || '',
            })
            .then(() => {
                this.assignmentsState.refresh(true);
                this.close();
            })
            .catch(() => {
                // do nothing
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeJoinDeparturesModal();
    }
}
