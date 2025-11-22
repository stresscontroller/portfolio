import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {
    checkPageFeatureAccess,
    Features,
    TourItinerary,
    TourServiceItineraryListItems,
    UIStatus,
    UserState,
} from '@app/core';
import { PermissionDirective } from '@app/shared';
import { TourItineraryState, UIState } from '../../../state';
import { BehaviorSubject, map } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-itinerary-table',
    templateUrl: './tour-itinerary-table.component.html',
    styleUrls: ['./tour-itinerary-table.component.scss'],
    imports: [
        CommonModule,
        TableModule,
        CheckboxModule,
        FormsModule,
        ButtonModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class TourItineraryTableComponent {
    @Input() tourItineraryList: TourItinerary[] = [];
    tourItineraryState = inject(TourItineraryState);
    uiState = inject(UIState);
    userState = inject(UserState);
    features = Features;

    allowReorder$ = this.userState.controls$.pipe(
        map((featureControls) => {
            return checkPageFeatureAccess(
                featureControls,
                Features.toursAndServicesEdit.name,
                Features.toursAndServicesEdit.pages.itinerary.name,
                Features.toursAndServicesEdit.pages.itinerary.features
                    .reorderItinerary.name
            );
        })
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    openEditTourPriceModal(item: TourItinerary): void {
        this.uiState.openEditTourItineraryModal(item);
    }

    openRemoveTourPriceModal(item: TourItinerary): void {
        this.uiState.openRemoveTourItineraryModal(item);
    }

    reorderRow(event: TableRowReorderEvent): void {
        if (event.dragIndex && event.dropIndex) {
            this.tourItineraryList = this.moveArrayElement(
                this.tourItineraryList,
                event.dragIndex,
                (event.dropIndex =
                    event.dragIndex > event.dropIndex
                        ? event.dropIndex
                        : event.dropIndex === 0
                        ? 0
                        : event.dropIndex - 1)
            );
        }
    }

    moveArrayElement(
        array: TourItinerary[],
        fromIndex: number,
        toIndex: number
    ): TourItinerary[] {
        const element = array.splice(fromIndex, 1)[0];
        array.splice(toIndex, 0, element);
        return array;
    }

    saveReorderedRowIndexes(): void {
        const rowData = this.tourItineraryList;
        const changedData: TourServiceItineraryListItems[] = [];

        const tourId = this.tourItineraryState.tourId$.getValue();
        if (!tourId) {
            this.status$.next('error');
            return;
        }
        rowData.map((row, index) => {
            changedData.push({
                tourItineraryId: row.tourItineraryId,
                tourId: tourId,
                description: row.description,
                transportationType: row.transportationType,
                time: row.time,
                orderNo: index + 1,
            });
        });
        this.tourItineraryState
            .saveTourItineraryList(changedData)
            .then(() => {
                this.status$.next('success');
                this.tourItineraryState.refresh();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
