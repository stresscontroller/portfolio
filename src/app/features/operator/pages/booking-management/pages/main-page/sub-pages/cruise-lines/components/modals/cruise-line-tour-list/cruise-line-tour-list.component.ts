import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    Subject,
    combineLatest,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
    BehaviorSubject,
} from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Table, TableModule } from 'primeng/table';

import { CruiseLineTourListItem } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

import { EditCruiseLineTourModalComponent } from '../edit-cruise-line-tour/edit-cruise-line-tour.component';
import { UIState, CruiseLinesState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-cruise-line-tour-list-modal',
    templateUrl: './cruise-line-tour-list.component.html',
    styleUrls: ['./cruise-line-tour-list.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
        InputSwitchModule,
        TableModule,
        EditCruiseLineTourModalComponent,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
})
export class CruiseLineTourListModalComponent {
    @ViewChild('cruiseLineTourListTable', { static: false })
    cruiseLineTourListTable: Table | undefined;

    uiState = inject(UIState);
    cruiseLinesState = inject(CruiseLinesState);

    tourServiceList$ = this.uiState.modals$.pipe(
        map((modals) => modals.tourServiceList),
        distinctUntilChanged()
    );
    isOpen$ = this.tourServiceList$.pipe(map((modal) => modal.isOpen));
    context$ = this.tourServiceList$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = this.cruiseLinesState.status$;
    private destroyed$ = new Subject<void>();
    shipCompanyName$ = new BehaviorSubject<string>('');
    private shipCompanyId: number = 0;
    isLive: boolean = false;
    cruiseLineTourList$ = this.cruiseLinesState.cruiseLineTourList$;
    keyword: string = '';
    ngOnInit(): void {
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return combineLatest([
                        this.context$.pipe(
                            distinctUntilChanged((prev, curr) => {
                                return (
                                    JSON.stringify(prev) ===
                                    JSON.stringify(curr)
                                );
                            })
                        ),
                        this.context$,
                    ]);
                })
            )
            .subscribe(([context]) => {
                if (context) {
                    this.isLive = context.isLive;
                    this.shipCompanyId = context.shipCompanyId;
                    this.shipCompanyName$.next(context.shipCompanyName);
                    this.cruiseLinesState.loadCruiseLineTourList(
                        this.shipCompanyId
                    );
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    search(): void {
        if (this.cruiseLineTourListTable) {
            this.cruiseLineTourListTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openEditCruiseLineTourModal(config: CruiseLineTourListItem): void {
        this.uiState.openEditCruiseLineTourModal(config);
    }

    close(): void {
        this.uiState.closeEditCruiseLineTourModal();
    }
}
