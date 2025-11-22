import { TourInventoryItem } from './api-inventory-management.model';

export interface AdminTourInventorySearch {
    companyId: string;
    tourIDs: string;
    shipCompanyId: number | null;
    shipId: number | null;
    startDate: string; // "2024-06-01",
    endDate: string; // "2024-06-02",
    isActive: boolean;
    portId: number | null;
}

export interface AdminTourInventory {
    tourInventoryID: number;
    tourID: number;
    shipCompanyId: number | null;
    shipId: number | null;
    tourInventoryDate: string; // "2024-09-03T00:00:00",
    tourInventoryDateString: string; // "9/3/2024",
    tourInventoryTime: string; // "07:30:00",
    tourInventoryTimeString: string; //"07:30 AM",
    tourInventoryAllocatedSeats: number; // 24,
    companyUniqueID: string; // "72aca93d-62a8-48e8-abf5-9814dc7604ae",
    cruiseLineName: string; // "Direct Booking",
    cruiseShipName: string; // "-",
    tourName: string; // "Glacier Point ATV Exploration2",
    portId: number; // 1,
    portName: string; // "Skagway, Alaska",
    partnerId: number | null;
    partnerName: string; // "-",
    bookingChildren: number;
    bookingAdults: number;
    passengerSold: number;
    totalSeatTour: number;
    totalSoldDollar: number | null;
    totalAvailableDollar: number | null;
    capacity: number; // 4.00,
    adultCost: number; // 375.01,
    childCost: number; // 350.02,
    seatAvailability: number; // 23,
    shipCompanyLogo: string | null;
    companyLogo: string | null;
    tourImagePath: string | null;
    isCanceled: boolean;
    specialNotes: string | null;
    cruiseLineTourCode: string;
    numberOfDepartureAtSameTime: string; // "1/1",
    cancellationDate: string | null;
    isCancelled: boolean | null;
    cancellationReason: number | null;
    cancelledby: string | null;
}

export function toTourInventoryItem(
    adminTourInventory: AdminTourInventory
): TourInventoryItem {
    let startTime = '';
    try {
        startTime = `${adminTourInventory.tourInventoryDate.split('T')[0]}T${
            adminTourInventory.tourInventoryTime
        }`;
    } catch (e) {
        // prevent error
    }
    return {
        unallocatedTourInventoryID: adminTourInventory.tourInventoryID,
        tourID: adminTourInventory.tourID,
        shipCompanyId: adminTourInventory.shipCompanyId,
        shipId: adminTourInventory.shipId,
        shipCompanyName: adminTourInventory.cruiseShipName ?? '',
        shipInfoId: null,
        unallocatedTourInventoryDate: adminTourInventory.tourInventoryDate,
        tourInventoryDateString: adminTourInventory.tourInventoryDateString,
        tourInventoryDateddMMMyyyy: '',
        unallocatedTourInventoryTime: adminTourInventory.tourInventoryTime,
        unallocatedTourEndTime: null,
        tourInventoryTimeString: adminTourInventory.tourInventoryTimeString,
        unallocatedTourInventoryAllocatedSeats:
            adminTourInventory.tourInventoryAllocatedSeats,
        companyId: adminTourInventory.companyUniqueID || '',
        isReleased: true,
        isActive: true,
        createdDate: null,
        createdBy: null,
        lastModifiedDate: null,
        lastModifiedBy: null,
        shipName: adminTourInventory.cruiseShipName,
        portId: adminTourInventory.portId,
        partnerId: adminTourInventory.partnerId,
        unallocatedTourInventoryTimeString:
            adminTourInventory.tourInventoryTimeString,
        cruiseShipName: adminTourInventory.cruiseShipName,
        cruiseLineName: adminTourInventory.cruiseLineName,
        tourName: adminTourInventory.tourName,
        portName: adminTourInventory.portName,
        partnerName: adminTourInventory.partnerName,
        totalUnallocatedSeatTour:
            adminTourInventory.tourInventoryAllocatedSeats,
        bookingChildren: adminTourInventory.bookingChildren,
        bookingAdults: adminTourInventory.bookingAdults,
        adultCost: adminTourInventory.adultCost,
        childCost: adminTourInventory.childCost,
        capacity: adminTourInventory.capacity,
        frequency: null,
        intervalHours: null,
        intervalMinutes: null,
        startDate: adminTourInventory.tourInventoryDate,
        endDate: null,
        totalBooking: adminTourInventory.passengerSold,
        id: adminTourInventory.tourInventoryID,
        color: null,
        backgroundColor: null,
        allDay: false,
        start: startTime,
        startString: adminTourInventory.tourInventoryDate,
        url: null,
        title: `${adminTourInventory.tourInventoryTimeString} (${adminTourInventory.tourInventoryAllocatedSeats})`,
        description: adminTourInventory.tourName,
        className: null,
        recurranceId: null,
        isRecurranceUpdate: false,
        userId: null,
        seatsSold: adminTourInventory.passengerSold,
    };
}
