export interface AdminUpdateBooking {
    reservationBookingId: string;
    bookingId: number;
    tourInventoryId: number;
    adults: number;
    children: number;
    infant: number;
    serviceFee: number | null;
    adultPrice: number | null;
    childPrice: number | null;
    discountAmount: number | null;
    discountType: string | null;
    discountCode: string | null;
    createdBy: string;
    refundAmount: number | null;
    partnerId: number | null;
    bookingNotes: string | null;
    participationNotes: string | null;
    tourInventoryNotes: string | null;
    bookingFirstName: string | null;
    bookingLastName: string | null;
    email: string | null;
    agentsGuestEmail: string | null;
    leadFirstName: string | null;
    leadLastName: string | null;
    primaryPhoneNumber: string | null;
    pickUpLocation: string | null;
    shipCompanyId: number | null;
    shipId: number | null;
    paymentType: string;
    chargeCreditCard: {
        cardHolderName: string;
        cardNumber: string;
        cardCode: string;
        expirationDate: string;
    };
}

export interface CruiseLineListItem {
    shipCompanyId: number;
    shipCompanyName: string;
    shipCompanyAddress: string;
    shipCompanyLogo: string;
    dataSource: string;
    isLive: boolean;
    shipCompanyColor: string;
    shipCompanyBackgroundColor: string;
    shipCounts: number;
}

export interface TourServiceListItem {
    shipCompanyTourId: number;
    netRateAdult: number;
    netRateChild: number;
    cruiseLineTourCode: string;
    cruiseLineTourName: string;
    startDate: string;
    isOffered: boolean;
    tourId: number;
    tourName: string;
}

export interface CruiseLineDetails {
    shipCompanyId: number;
    shipCompanyName: string;
    shipCompanyLogo: string;
    shipCompanyAddress: string;
    dataSource: string;
    isLive: boolean;
    shipCompanyColor: string;
    shipCompanyBackgroundColor: string;
    invMgrFname: string;
    invMgrLname: string;
    invMgrEmail: string;
    invMgrPhone: string;
}

export interface CruiseLineConfig {
    shipCompanyId: number;
    shipCompanyName: string;
    shipCompanyAddress?: string;
    isLive?: boolean;
    shipCompanyColor?: string;
    shipCompanyBackgroundColor?: string;
    invMgrFname?: string;
    invMgrLname?: string;
    invMgrEmail?: string;
    invMgrPhone?: string;
}

export interface CruiseLineTourListItem {
    shipCompanyTourId: number;
    tourId: number;
    tourName: string;
    cruiseLineTourName: string;
    cruiseLineTourCode: string;
    netRateAdult: number;
    netRateChild: number;
    startDate: string;
    isOffered: boolean;
}

export interface CruiseLineTourNameCodeConfig {
    shipCompanyId: number;
    tourId: number;
    cruiseLineTourCode: string;
    cruiseLineTourName: string;
    companyId: string;
}

export interface CruiseLineTourConfig {
    tourId: number;
    shipCompanyId: number;
    adultRate: number;
    childRate: number;
    cruiseLineTourCode: string;
    cruiseLineTourName: string;
    startDate: string;
    isOffered: boolean;
    companyId: string;
}

export interface CruiseShipListItem {
    shipId: number;
    shipCompanyName: string;
    shipName: string;
    dataSource: string;
    shipStatus: string;
    capacity: number;
}

export interface UpcomingShipScheduleConfig {
    shipId: number;
    startDate: string;
    endDate: string;
    companyId: string;
}

export interface UpcomingShipScheduleListItem {
    shipScheduleId: number;
    arrivalDate: Date;
    departureDate: Date;
    portName: string;
}

export interface CruiseShipDetails {
    shipId: number;
    shipName: string;
    shipCompanyId: number;
    capacity: number;
    shipStatus: number;
    currency: string;
    launch_year: number;
    speed: number;
    deck_count: number;
    cabin_count: number;
    language: string;
    crew_count: number;
    length: number;
    width: number;
    gross_tonnage: number;
}

export interface CruiseShipConfig {
    shipId: number;
    shipName: string;
    shipCompanyId: number;
    capacity: number;
    shipStatus: number;
    currency: string;
    launch_year: number;
    speed: number;
    deck_count: number;
    cabin_count: number;
    language: string;
    crew_count: number;
    length: number;
    width: number;
    gross_tonnage: number;
    companyId: string;
}

export interface CruiseShipScheduleListItem {
    shipScheduleId: number;
    shipId: number;
    portId: number;
    portName: string;
    arrivalDate: string;
    departureDate: string;
    cruiseStartsOn: string;
    cruiseEndsOn: string;
    isActive: boolean;
    ref_Id: string;
    widgetyPortVisitRowId: number;
    duration: string;
}

export interface CruiseShipScheduleConfig {
    shipScheduleId: number;
    shipId: number;
    portId: number;
    arrivalDate: string;
    departureDate: string;
    cruiseStartsOn: string;
    cruiseEndsOn: string;
    isActive: boolean;
    ref_Id: string;
    companyId: string;
}
