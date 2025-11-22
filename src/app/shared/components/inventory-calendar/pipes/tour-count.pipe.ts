import { Pipe, PipeTransform } from '@angular/core';
import { CalendarMonthDay } from '../models';
interface TourCounts {
    released: number;
    releasedDetails: {
        tourName: string;
        cruiseLineName: string;
        shipId: number | null;
        startTime: Date;
        color: string;
        background: string;
        extras: {
            seatsSold: number;
            seatsAllocated: number;
        };
    }[];
    allocated: number;
    allocatedDetails: {
        tourName: string;
        cruiseLineName: string;
        shipId: number | null;
        startTime: Date;
        color: string;
        background: string;
        maxCapacity: number;
    }[];
    unallocated: number;
    unallocatedDetails: {
        tourName: string;
        startTime: Date;
        maxCapacity: number;
    }[];
}
@Pipe({
    standalone: true,
    pure: true,
    name: 'tourCount',
})
export class TourCountPipe implements PipeTransform {
    transform(value: CalendarMonthDay[]): TourCounts {
        const tourCount: TourCounts = {
            released: 0,
            releasedDetails: [],
            allocated: 0,
            allocatedDetails: [],
            unallocated: 0,
            unallocatedDetails: [],
        };
        value.forEach((data) => {
            const tour = data.meta;
            if (tour.isReleased) {
                tourCount.released = tourCount.released + 1;
                if (tour.description) {
                    tourCount.releasedDetails.push({
                        tourName: tour.description,
                        cruiseLineName:
                            tour.shipId !== null && tour.shipId < 1
                                ? 'Book Direct'
                                : tour.cruiseLineName || '',
                        startTime: tour.start,
                        shipId: tour.shipId,
                        background: tour.background,
                        color: tour.color,
                        extras: {
                            seatsSold: tour.extras.seatsSold,
                            seatsAllocated: tour.extras.seatsAllocated,
                        },
                    });
                }
            } else if (!tour.isReleased && tour.shipId === null) {
                tourCount.unallocated = tourCount.unallocated + 1;
                if (tour.description) {
                    tourCount.unallocatedDetails.push({
                        tourName: tour.description,
                        startTime: tour.start,
                        maxCapacity: tour.extras?.seatsAllocated || 0,
                    });
                }
            } else if (!tour.isReleased && tour.shipId !== null) {
                tourCount.allocated = tourCount.allocated + 1;
                if (tour.description) {
                    tourCount.allocatedDetails.push({
                        tourName: tour.description,
                        cruiseLineName:
                            tour.shipId !== null && tour.shipId < 1
                                ? 'Book Direct'
                                : tour.cruiseLineName || '',
                        startTime: tour.start,
                        shipId: tour.shipId,
                        background: tour.background,
                        color: tour.color,
                        maxCapacity: tour.extras?.seatsAllocated || 0,
                    });
                }
            }
        });
        return tourCount;
    }
}
