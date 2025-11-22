import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
    SalesReportTableComponent,
    PortTableComponent,
    TourTableComponent,
    ShipTableComponent,
} from './components';
import { DropdownModule } from 'primeng/dropdown';
import { UIState, SalesReportState } from './state';
import {
    AddNewFileHeaderComponent,
    EditFileReportHeaderComponent,
    RemoveFileReportHeaderComponent,
    AddNewShipComponent,
    EditShipComponent,
    RemoveShipComponent,
    AddNewPortComponent,
    EditPortComponent,
    RemovePortComponent,
    AddNewTourComponent,
    EditTourComponent,
    RemoveTourComponent,
    FileUploadComponent,
} from './components';
import { Features, OperatorFiltersState } from '@app/core';
import { Subject, map, takeUntil } from 'rxjs';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-sales-and-report',
    templateUrl: './sales-and-report.component.html',
    styleUrls: ['./sales-and-report.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DropdownModule,
        SalesReportTableComponent,
        AddNewFileHeaderComponent,
        RemoveFileReportHeaderComponent,
        EditFileReportHeaderComponent,
        AddNewShipComponent,
        EditShipComponent,
        RemoveShipComponent,
        AddNewPortComponent,
        EditPortComponent,
        RemovePortComponent,
        AddNewTourComponent,
        EditTourComponent,
        RemoveTourComponent,
        PortTableComponent,
        TourTableComponent,
        ShipTableComponent,
        FileUploadComponent,
        PermissionDirective,
        LoaderEmbedComponent,
    ],
    providers: [SalesReportState],
})
export class SalesAndReportComponent {
    operatorFiltersState = inject(OperatorFiltersState);
    salesReportState = inject(SalesReportState);
    uiState = inject(UIState);
    cruiseLines$ = this.operatorFiltersState.cruiseLines$.pipe(
        map((cruiseLine) => {
            return [
                {
                    shipCompanyName: 'All Cruise Lines',
                    shipCompanyId: -1,
                },
                ...cruiseLine,
            ];
        })
    );
    isLoading$ = this.salesReportState.reportFileStatus$.pipe(
        map(
            (statuses) =>
                statuses.fileHeaderReportStatus === 'loading' ||
                statuses.shipReportStatus === 'loading' ||
                statuses.tourReportStatus === 'loading' ||
                statuses.portReportStatus === 'loading'
        )
    );
    features = Features;
    reportingTableData$ = this.salesReportState.reportingTableData$;
    selectedCruise: number | null = null;
    inventory = [
        {
            shipCompanyId: 1,
            shipCompanyName: 'Carnival',
            shipName: 'Carnival Cruise',
            port: 'San Diego',
            tour: 'San Diego City Tour',
        },
    ];

    tour = [
        {
            shipCompanyId: 5,
            shipCompanyName: 'Orinoco',
            shipName: 'Explore Cruise',
            port: 'San Francisco',
            tour: 'San Francison City Tour',
        },
    ];

    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.salesReportState.init();
    }

    ngAfterContentInit() {
        this.salesReportState.shipCompanyConfig$
            .pipe(takeUntil(this.destroy$))
            .subscribe((config) => {
                this.selectedCruise = config || 0;
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openAddNewReportModal() {
        this.uiState.openAddNewReportModal();
    }

    closeAddNewReportModal() {
        this.uiState.closeAddNewReportModal();
    }

    onCruiseLineChange() {
        this.salesReportState.updateSelectCruiseLineConfig(
            this.selectedCruise || 0
        );
    }

    openAddNewShipModal() {
        this.uiState.openAddNewShipModal();
    }

    closeAddNewShipModal() {
        this.uiState.closeAddNewShipModal();
    }

    openAddNewPortModal() {
        this.uiState.openAddNewPortModal();
    }

    closeAddNewPortModal() {
        this.uiState.closeAddNewPortModal();
    }

    openAddNewTourModal() {
        this.uiState.openAddNewTourModal();
    }

    closeAddNewTourModal() {
        this.uiState.closeAddNewTourModal();
    }

    openUploadFileModal() {
        this.uiState.openUploadFileModal();
    }

    closeUploadFileModal() {
        this.uiState.closeUploadFileModal();
    }
}
