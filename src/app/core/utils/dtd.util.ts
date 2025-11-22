import { OTCBookingItem } from '@app/core';

export function sortBookingByPickupLocationAndShipName(
    bookings: OTCBookingItem[]
): OTCBookingItem[] {
    if (!bookings) {
        return [];
    }
    try {
        // Sort the bookings by pickupLocationName and then by shipName, accounting for null values
        return bookings.sort((a, b) => {
            if (a.pickupLocationName < b.pickupLocationName) return -1;
            if (a.pickupLocationName > b.pickupLocationName) return 1;
            // If pickupLocationName is the same, then sort by shipName, handling null values
            if (a.shipName === null) return 1;
            if (b.shipName === null) return -1;
            if (a.shipName < b.shipName) return -1;
            if (a.shipName > b.shipName) return 1;
            return 0;
        });
    } catch (err) {
        return bookings;
    }
}
