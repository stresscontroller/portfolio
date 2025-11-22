import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    ReactiveFormsModule,
    FormGroup,
    FormControl,
    Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {
    CruiseCalendarState,
    DtdAssignmentDetails,
} from '../../../cruise-calendar.state';
import {
    BehaviorSubject,
    Subject,
    combineLatest,
    distinctUntilChanged,
    filter,
    map,
    takeUntil,
} from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import {
    CalendarScheduleState,
    DTDdockDetails,
    OperatorFiltersState,
    UIStatus,
} from '@app/core';

@Component({
    standalone: true,
    selector: 'app-dock-assignment-modal',
    templateUrl: './dock-assignment.component.html',
    styleUrls: ['./dock-assignment.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        InputTextModule,
        DropdownModule,
        ButtonModule,
    ],
})
export class DockAssignmentModalComponent {
    calendarScheduleState = inject(CalendarScheduleState);
    cruiseCalendarState = inject(CruiseCalendarState);
    operatorFiltersState = inject(OperatorFiltersState);

    dockAssignmentModal$ = this.cruiseCalendarState.modals$.pipe(
        map((modals) => modals.dockAssignment),
        distinctUntilChanged()
    );

    isOpen$ = this.dockAssignmentModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.dockAssignmentModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    docks$ = combineLatest([
        this.calendarScheduleState.docks$,
        this.context$,
    ]).pipe(
        map(([docks, context]) => {
            if (context?.portId && docks) {
                return docks.filter((dock) => dock.portId === context.portId);
            } else {
                return docks;
            }
        })
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    dockAssignmemtForm = new FormGroup({
        shipName: new FormControl<string | null>(null),
        portName: new FormControl<string | null>(null),
        assignmentDate: new FormControl<string | null>(null),
        time: new FormControl<string | null>(null),
        dockId: new FormControl<number | null>(null, [Validators.required]),
    });

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.operatorFiltersState.getPorts().then((ports) => {
            this.context$
                .pipe(takeUntil(this.destroyed$))
                .subscribe((context) => {
                    if (context) {
                        this.dockAssignmemtForm.patchValue(
                            {
                                shipName: context.shipName,
                                portName: ports?.find(
                                    (port) => port.portId === context.portId
                                )?.portName,
                                assignmentDate: context.assignmentDate,
                                time: context.time,
                                dockId: context.dockId,
                            },
                            { emitEvent: false }
                        );
                    } else {
                        this.dockAssignmemtForm.reset();
                    }
                });
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.dockAssignmemtForm.reset();
        this.cruiseCalendarState.closeDockAssignmentModal();
    }

    updateAssignment(assignmentDetails: DtdAssignmentDetails): void {
        if (this.dockAssignmemtForm.invalid) {
            Object.values(this.dockAssignmemtForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const docks = this.calendarScheduleState.docks$.getValue();
        const formValue = this.dockAssignmemtForm.value;
        const selectedDock = docks.find(
            (dock) => dock.dockId === formValue.dockId
        );
        if (!selectedDock) {
            this.status$.next('error');
            return;
        }
        const dockAssignment: DTDdockDetails = {
            companyUniqueID: assignmentDetails.companyUniqueID || '',
            portId: assignmentDetails.portId || 0,
            assignmentDate: assignmentDetails.assignmentDate || '',
            shipId: assignmentDetails.shipId || 0,
            dockId: selectedDock.dockId,
            dockName: selectedDock.dockName,
        };
        this.status$.next('loading');
        this.calendarScheduleState
            .updateDtdAssignment(dockAssignment)
            .then(() => {
                this.status$.next('idle');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
