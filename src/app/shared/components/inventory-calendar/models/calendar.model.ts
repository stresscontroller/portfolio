export interface CalendarShip {
    id: string;
    start: Date;
    end: Date | null;
    background: string;
    color: string;
    description: string;
    shipId: number | null;
    shipCompanyId: number | null;
    portId: number | null;
    portName: string;
    totalBooking: number;
    shipCapacity: number | null;
}

export interface CalendarTour {
    id: string;
    start: Date;
    end: Date;
    background: string;
    color: string;
    description: string | null;
    portId: number;
    shipId: number | null;
    shipCompanyId: number | null;
    cruiseLineName: string | null;
    cruiseShipName: string | null;
    isReleased: boolean | null;
    isUnallocated: boolean;
    totalBooking: number;
    unallocatedTourInventoryId: number;
    tourId: number;

    extras?: {
        seatsSold?: number;
        seatsAllocated?: number;
    };
}

export interface CalendarData {
    ships: Record<string, CalendarShip[]>;
    tours: Record<
        string,
        Record<
            string,
            {
                start: Date;
                tours: CalendarTour[];
            }
        >
    >;
}

export interface CalendarMonthDay {
    id: string;
    start: Date;
    end: Date;
    title: string;
    color: {
        primary: string;
        secondary: string;
    };
    meta: {
        start: Date;
        shipId: number | null;
        shipCompanyId: number | null;
        cruiseLineName: string | null;
        cruiseShipName: string | null;
        isReleased: boolean | null;
        background: string;
        color: string;
        date: string | undefined | null;
        description: string | undefined | null;
        extras: {
            seatsSold: number;
            seatsAllocated: number;
        };
    };
}
