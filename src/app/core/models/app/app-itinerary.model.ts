export interface Itinerary {
    arrivalDate: string;
    departureDate: string;
    day: number;
    endsAt: string;
    isManual: boolean | null;
    portName: string | null;
    refId: string;
    shipName: string;
    startOn: string;
    startsAt: string;
}

export interface ShipItinerary {
    shipId: number;
    shipName: string;
    arrivalDate: string;
    departureDate: string;
    shipCompanyId: number;
    shipCompanyName: string;
    portId: number;
    portName: string | null;
}
