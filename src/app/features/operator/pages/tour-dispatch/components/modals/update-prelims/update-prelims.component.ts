import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, distinctUntilChanged, filter, map, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
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
    selector: 'app-update-prelims-modal',
    templateUrl: './update-prelims.component.html',
    styleUrls: ['./update-prelims.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        TourInventoryTimePipe,
        ModalTourDetailsComponent,
        PermissionDirective,
    ],
})
export class UpdatePrelimsModalComponent {
    @ViewChild('prelimInput') prelimInput?: ElementRef;

    assignmentsState = inject(AssignmentsState);
    operatorFiltersState = inject(OperatorFiltersState);
    uiState = inject(UIState);
    userState = inject(UserState);
    prelimForm = new FormGroup({
        prelim: new FormControl<number | null>(null),
    });
    features = Features;

    updatePrelimsModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.updatePrelims),
        distinctUntilChanged()
    );

    isOpen$ = this.updatePrelimsModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.updatePrelimsModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = this.assignmentsState.status$.pipe(
        map((status) => status.updatePrelim)
    );
    private isDestroyed$ = new Subject<void>();
    ngAfterViewInit(): void {
        this.operatorFiltersState.getEquipmentList();
        this.operatorFiltersState.getGuides();
        this.context$
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((context) => {
                if (context?.assignment) {
                    this.prelimForm.patchValue(
                        {
                            prelim: context.assignment.preLim,
                        },
                        {
                            emitEvent: false,
                        }
                    );
                    // wait for next tick
                    setTimeout(() => {
                        if (this.prelimInput?.nativeElement) {
                            this.prelimInput.nativeElement.focus();
                            this.prelimInput.nativeElement.select();
                        }
                    });
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
        if (this.prelimForm.invalid) {
            Object.values(this.prelimForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const userInfo = this.userState.aspNetUser$.getValue();
        if (!userInfo) {
            return;
        }
        const formValue = this.prelimForm.getRawValue();
        this.assignmentsState
            .updatePrelim([
                {
                    dtdAssignmentGuideId: assignment.dtdAssignmentGuideId || 0,
                    actualAdults: assignment.actualAdults || null,
                    actualChildren: assignment.actualChildren || null,
                    cruiseLineEscorts: assignment.cruiseLineEscorts || null,
                    createdBy: '',
                    specialNotes: assignment.specialNotes || '',
                    payingAdditionalGuests:
                        assignment.payingAdditionalGuests || 0,
                    isClosed: assignment.isClosed,
                    tourInventoryId: assignment.tourInventoryId,
                    prelim: formValue.prelim,
                    isPrelimOnlyUpdate: true,
                },
            ])
            .then(() => {
                this.close();
                this.assignmentsState.resetIndividualStatus('updatePrelim');
            });
    }

    close(): void {
        this.prelimForm.reset();
        this.uiState.closeUpdatePrelimsModal();
    }
}
