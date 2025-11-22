import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { OrderListModule } from 'primeng/orderlist';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Features } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { TourEditState } from '../../state';
import { UIState, TourItineraryState } from './state';
import {
    AddNewTourItineraryModalComponent,
    EditTourItineraryModalComponent,
    RemoveTourItineraryModalComponent,
    TourItineraryTableComponent,
} from './components';

@Component({
    standalone: true,
    selector: 'app-itinerary',
    templateUrl: './itinerary.component.html',
    styleUrls: ['./itinerary.component.scss'],
    imports: [
        CommonModule,
        OrderListModule,
        ButtonModule,
        TableModule,
        TourItineraryTableComponent,
        AddNewTourItineraryModalComponent,
        EditTourItineraryModalComponent,
        RemoveTourItineraryModalComponent,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
    providers: [UIState, TourItineraryState],
})
export class ItineraryComponent {
    uiState = inject(UIState);
    tourEditState = inject(TourEditState);
    tourItineraryState = inject(TourItineraryState);
    features = Features;
    tourDetails$ = this.tourItineraryState.tourDetails$.pipe(
        map((tourDetails) => {
            return {
                ...tourDetails,
                tourItineraryList: tourDetails?.tourItineraryList?.map(
                    (itinerary) => {
                        return {
                            ...itinerary,
                            time: this.formatTime(itinerary.time),
                        };
                    }
                ),
                totalItineraryDurationMinutes:
                    tourDetails?.tourItineraryList?.reduce((acc, curr) => {
                        acc += this.parseTime(curr.time);
                        return acc;
                    }, 0),

                durationMinutes: tourDetails?.duration
                    ? this.parseTime(tourDetails.duration)
                    : 0,
            };
        }),
        map((formattedTourDetails) => {
            return {
                ...formattedTourDetails,
                totalItineraryDuration:
                    formattedTourDetails.totalItineraryDurationMinutes
                        ? this.durationToDisplayTime(
                              formattedTourDetails.totalItineraryDurationMinutes
                          )
                        : '',
                tourDuration: formattedTourDetails.durationMinutes
                    ? this.durationToDisplayTime(
                          formattedTourDetails.durationMinutes
                      )
                    : '',
            };
        })
    );
    status$ = this.tourEditState.status$.pipe(
        map((status) => status.loadTourDetails)
    );

    refresh(): void {
        this.tourItineraryState.refresh();
    }

    openAddItineraryModal(): void {
        this.uiState.openAddNewTourItineraryModal();
    }

    private durationToDisplayTime(duration: number): string {
        if (!duration) {
            return '0 minutes';
        }
        const hours = Math.floor(duration / 60);
        const minutes = Math.floor(duration % 60);
        if (hours === 0) {
            return `${minutes} minutes`;
        }
        if (minutes === 0) {
            return `${hours} hours`;
        }
        if (hours > 0 && minutes > 0) {
            return `${hours} hours ${minutes} minutes`;
        }
        return '0 minutes';
    }

    private parseTime(time: string): number {
        const standardTimePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
        const naturalTimePattern =
            /(\d+)\s*(hour|hours|minute|minutes|min|h|m)/gi;

        let totalMinutes = 0;
        let match;

        // First, check for standard time format (HH:mm:ss or HH:mm)
        if ((match = standardTimePattern.exec(time)) !== null) {
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            totalMinutes = hours * 60 + minutes;
        } else {
            // Process natural language time descriptions
            const matches = time.match(naturalTimePattern);
            if (matches) {
                matches.forEach((m) => {
                    const parts =
                        /(\d+)\s*(hour|hours|minute|minutes|min|h|m)/i.exec(m);
                    if (parts) {
                        const value = parseInt(parts[1], 10);
                        const unit = parts[2].toLowerCase();

                        if (unit.startsWith('hour') || unit === 'h') {
                            totalMinutes += value * 60;
                        } else if (
                            unit.startsWith('minute') ||
                            unit === 'min' ||
                            unit === 'm'
                        ) {
                            totalMinutes += value;
                        }
                    }
                });
            }
        }

        return totalMinutes;
    }

    private formatTime(time: string): string {
        const totalMinutes = this.parseTime(time);
        return `${totalMinutes} minutes`;
    }
}
