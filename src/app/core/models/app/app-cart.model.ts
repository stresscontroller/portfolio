import { TourTimes } from '../api';

export interface Cart extends AdditionalCartInfo {
    cartTourServicesId: number;
    cartTourServicesUniqueId: string;
    tourId: number;
    tourName: string;
    adultPrice: number;
    childPrice: number;
    shipCompanyId: number;
    shipCompanyName: string | null;
    shipId: number;
    shipName: string | null;
    bookingDate: string; // "2023-06-11T00:00:00"
    bookingTime: string; // "10:30:00"
    isCruisePassenger: boolean;
    adults: number;
    children: number;
    infants: number;
    tourInventoryId: number;
    pickupLocationId: number;
    pickupLocationName: string;
    pickupAddress: string;
    latitude: string;
    longitude: string;
    availableSeats: number;
    shoppingCartImagePath: string;
    addonList: Addons[];

    // TODO: these will be required to be added on the server
    // added to the API
    leadFirstName?: string;
    leadLastName?: string;
    availableBookingTimes?: TourTimes[];
    companyId?: string;
}

export interface NewCart extends AdditionalCartInfo {
    cartTourServicesId: number;
    adults: number;
    children: number;
    infants: number;
    tourInventoryId: number;
    shipCompanyId: number;
    shipId: number;
    isCruisePassenger: boolean;
    addonList: Addons[];
    tourId: number;
    pickupLocationId: number; // required by the server

    // not required by server, but is displayed in cart page
    tourName: string;
    shoppingCartImagePath: string;
    adultPrice: number;
    childPrice: number;
    bookingDate?: string; // "2023-06-11T00:00:00"
    bookingTime?: string; // "10:30:00"
    availableSeats?: number; // to prevent users from editing the number of participants beyond the seat limit

    // these will be required before  checking out
    // TODO: need to check if this is associated per cart item or globally
    // added to the API
    leadFirstName?: string;
    leadLastName?: string;
    availableBookingTimes?: TourTimes[];
    companyId?: string;
}

export interface Addons {
    cartAddonsId: number;
    addonsId: number;
    qty: number;
}

export interface DiscountCodeDetails {
    discountID: number;
    discountCode: string;
    discountName: string;
    discountPercentage: number;
    discountType: string;
}

export interface AdditionalCartInfo {
    tax?: number;
    fee?: number;
    totalCost?: number;
    bookingAmount?: number;
    discountedBookingAmount?: number;
    discountedFee?: number;
    discountedTax?: number;
    discountedTotalCost?: number;
}
