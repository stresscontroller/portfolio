import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DtdAssignmentDetails {
    companyUniqueID: string | null;
    assignmentDate: string | null;
    shipId: number | null;
    dockId: number | null;
    portId: number | null;
    dockName: string | null;
    shipName: string | null;
    portName: string | null;
    time: string | null;
}

@Injectable()
export class CruiseCalendarState {
    modals$ = new BehaviorSubject<{
        dockAssignment: {
            isOpen: boolean;
            context?: DtdAssignmentDetails;
        };
    }>({
        dockAssignment: {
            isOpen: false,
        },
    });

    openDockAssignmentModal(event: DtdAssignmentDetails): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            dockAssignment: {
                isOpen: true,
                context: event,
            },
        });
    }

    closeDockAssignmentModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            dockAssignment: {
                isOpen: false,
            },
        });
    }
}
