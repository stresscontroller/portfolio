import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject, filter } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { UIState, PositionsState } from '../../../state';
import { UIStatus } from '@app/core';
@Component({
    standalone: true,
    selector: 'app-remove-position-modal',
    templateUrl: './remove-position.component.html',
    styleUrls: ['./remove-position.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
    ],
})
export class RemovePositionModalComponent {
    uiState = inject(UIState);
    positionsState = inject(PositionsState);
    removePosition$ = this.uiState.modals$.pipe(
        map((modals) => modals.removePosition),
        distinctUntilChanged()
    );
    isOpen$ = this.removePosition$.pipe(map((modal) => modal.isOpen));
    context$ = this.removePosition$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');
    positionDetail$ = this.positionsState.positionDetails$;

    ngOnInit(): void {
        this.context$.subscribe((context) => {
            if (context) {
                this.positionsState.getPositionDetail(context);
            }
        });
    }

    remove(positionId: number): void {
        this.status$.next('loading');
        this.positionsState
            .deletePosition(positionId, false)
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
    close(): void {
        this.status$.next('idle');
        this.uiState.closeRemovePositionModal();
    }
}
