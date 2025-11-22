export interface ApiDiscountDetailsResponse {
    discountID: number;
    discountCode: string;
    discountName: string;
    discountPercentage: number;
    discountType: string;
}

export interface ApiBookingChargeRequest {
    reservationBookingId: string;
    bookingDate: string | undefined;
    tourInventoryID: number;
    adults: number;
    children: number;
    giftCardPIN: string;
    giftCardCode: string;
    addons: {
        addonId: number;
        addons: number;
    }[];
}

export interface ApiBookingChargeWithDiscountRequest
    extends ApiBookingChargeRequest {
    discountId: string;
}

export interface ApiBookingChargeWithDiscountResponse {
    id: number;
    bookingId: string | null;
    tourId: string | null;
    shoppingCartImagePath: string | null;
    bookingAmount: number;
    tax: number;
    fee: number;
    discount: number | null;
    discountId: string | null;
    totalCost: number;
    paymentId: string | null;
    refundAmount: string | null;
    adultPrice: number;
    childrenPrice: number;
    cancellationReasonID: string | number;
    notes: string | null;
    discountName: string | null;
    discountCode: string | null;
    discountType: string | null;
    discountPercentage: string | null;
}

export interface ApiCreateB2CUserRequest {
    id: string; // should be left as an empty string (will be populated on the backend)
    userName: string; // should be left as an empty string
    email: string;
    secondaryEmail: string;
    password: string;
    firstName: string;
    lastName: string;
    stateName: string;
    countryName: string;
    isActive?: boolean;
    phoneNumber?: string;
    companyUniqueId?: string; // Can add this in if you want to create a user under a specific company
}

export interface ApiBookingCancellationChargeAmount {
    name: string;
    bookingId: number;
    bookingNumber: string;
    emailId: string;
    bookingTotalCost: number;
    refundAmount: number;
    refundPolicyDescription: string;
}

export interface CompleteBookingDetails {
    reservationBookingId: string;
    bookingCart: {
        bookingId: number;
        companyId: string;
        shipCompanyId: number | null;
        shipId: number | null;
        tourId: number;
        bookingDate: string;
        bookingTime: string;
        tourInventoryId: number;
        pickUpLocation: string;
        adults: number;
        children: number;
        infants: number;
        leadFirstName: string;
        leadLastName: string;
        addons: {
            addonId: number;
            addons: number;
        }[];
    }[];
    bookingFirstName: string;
    bookingLastName: string;
    email: string;
    agentsGuestEmail?: string;
    primaryPhoneNumber: string;
    secondaryPhoneNumber: string;
    shippingFirstName: string;
    shippingLastName: string;
    bookingNotes: string;
    address: string;
    city: string;
    zipCode: string;
    countryId: number;
    stateId: number;
    giftCardPIN: string;
    giftCardCode: string;
    discountId: number;
    createdBy: string;
    partnerId: number;
    paymentType: string;
    chargeCreditCard?: {
        cardHolderName: string;
        cardNumber: string;
        cardCode: string;
        expirationDate: string;
    };
}

export interface UpdateBookingDetails {
    reservationBookingId: string;
    bookingCart: {
        bookingId: number;
        companyId: string;
        shipCompanyId: number;
        shipId: number;
        tourId: number;
        bookingDate: string;
        bookingTime: string;
        tourInventoryId: number;
        pickUpLocation: string;
        adults: number;
        children: number;
        infants: number;
        leadFirstName: string;
        leadLastName: string;
        addons: {
            addonId: number;
            addons: number;
        }[];
    }[];
    bookingFirstName: string;
    bookingLastName: string;
    email: string;
    agentsGuestEmail?: string;
    primaryPhoneNumber: string;
    secondaryPhoneNumber: string;
    shippingFirstName: string;
    shippingLastName: string;
    bookingNotes: string;
    address: string;
    city: string;
    zipCode: string;
    countryId: number;
    stateId: number;
    giftCardPIN: string;
    giftCardCode: string;
    discountId: number;
    createdBy: string;
    partnerId: number;
    paymentType: string;
    chargeCreditCard?: {
        cardHolderName: string;
        cardNumber: string;
        cardCode: string;
        expirationDate: string;
    };
}

export interface ApiPickupLocationItem {
    pickupLocationID: string;
    pickupLocationName: string;
}
