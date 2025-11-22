export interface ApiAssignment {
    companyName: string;
    tourId: number;
    tourInventoryID: number;
    tourInventoryTime: string;
    tourInventoryAllocatedSeats: number;
    tourTime: string;
    duration: string;
    shipName: string;
    tourName: string;
    tourShortName: string;
    preLim: number;
    final: number | null;
    actualTotal: number | null;
    actualAdults: number | null;
    actualChildren: number | null;
    cruiseLineEscorts: number | null;
    transportation: string | null;
    guideName: string | null;
    guideFullName: string | null;
    dockName: string | null;
    dtdAssignmentTransportationId: number | null;
    dTDAssignmentGuideVariableId: string | null; // TODO: verify this type
    dtdAssignmentGuideId: number | null; // TODO: verify this type
    payingAdditionalGuests: number;
    specialNotes: string | null;
    bookingFName: string | null;
    bookingLName: string | null;
    bookingAdults: number;
    bookingChildren: number;
    bookingEmail: string | null;
    bookingPhone: string | null;
    partnerId: number | null;
    totalBooked: number | null;
    isClosed: boolean;
    isOpen: boolean;
    mobleViewColumn: null; // TODO: verify this type
    total: number | null;
    equipmentNumber: number | null;
    maxCapacity?: number;
    tourInventoryEndTime: string;
    tourEndTime: string;
    actualDepartureTime: string | null;
    tourInventoryFromId: number;
    tourInventoryToId: number;
    fromGuests: number | null;
    toGuests: number | null;
    isCancelled: boolean | null;
    cancellationDate: string | null;
    cancellationReason: number | null;
    cancelledby: string | null;
}

/**
 * Example:
 *  {
        CompanyName: 'Alaska X',
        TourInventoryID: 11754,
        TourInventoryTime: {
            Hours: 8,
            Minutes: 0,
            Seconds: 0,
            Milliseconds: 0,
            Ticks: 288000000000,
            Days: 0,
            TotalDays: 0.3333333333333333,
            TotalHours: 8,
            TotalMilliseconds: 28800000,
            TotalMinutes: 480,
            TotalSeconds: 28800,
        },
        TourInventoryAllocatedSeats: 10,
        TourTime: '08:00 AM',
        ShipName: 'Norwegian Jewel',
        TourName: 'Chilkoot Horseback Adventure',
        PreLim: 0,
        Final: null,
        ActualTotal: null,
        ActualAdults: null,
        ActualChildren: null,
        CruiseLineEscorts: null,
        Transportation: null,
        GuideName: null,
        GuideFullName: null,
        DockName: null,
        DTDAssignmentGuideVariableId: null,
        DTDAssignmentGuideId: null,
        PayingAdditionalGuests: 0,
        SpecialNotes: null,
        BookingFName: null,
        BookingLName: null,
        BookingAdults: 0,
        BookingChildren: 0,
        BookingEmail: null,
        BookingPhone: null,
        PartnerId: null,
        TotalBooked: null,
        IsClosed: false,
        IsOpen: false,
        MobleViewColumn: null,
        Total: null,
    },
 */
