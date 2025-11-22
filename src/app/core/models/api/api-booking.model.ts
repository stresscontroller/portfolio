import { AdminUpdateBooking } from './api-booking-management.model';
import { CompleteBookingDetails } from './api-checkout.model';

export interface BookingDetails {
    noShowComment: string;
    bookingID: number;
    reservationBookingId: string;
    tourID: number;
    tourName: string;
    adultPrice: number;
    childPrice: number;
    shipCompanyId: number;
    shipCompanyName: string;
    shipId: number;
    shipName: string;
    paymentID: number;
    tourInventoryID: number;
    bookingDate: string;
    bookingTime: string;
    purchaseDate: string;
    bookingFName: string;
    bookingLName: string;
    bookingPhone: string;
    bookingEmail: string;
    agentsGuestEmail?: string;
    bookingAdults: number;
    bookingChildren: number;
    bookingInfants: number;
    bookingPickUp?: string;
    pickupLocationName: string;
    pickupAddress: string;
    bookingNotes: string;
    companyUniqueID: string;
    isActive: boolean;
    address?: string;
    city?: string;
    stateid: number;
    zip?: string;
    country: number;
    ipaddress?: string;
    latitude: number;
    longitude: number;
    bookingnumber: string;
    id?: string;
    partnerId: number;
    bookingQRCodeImagePath: string;
    isUsed: boolean;
    leadFirstName: string;
    leadLastName: string;
    partnerUserId: string;
    transId: string;
    accountNumber: string;
    accountType: string;
    shippingFirstName?: string;
    shippingLastName?: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingZip?: string;
    bookingAmountDetail: BookingAmountDetail;
    bookingQRCodeList: BookingQRCodeList[];
    bookingAddonList: string[];
    lastModifiedBy: string;
}

export interface PassengerInformation {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    shipCompanyName: string;
    shipName: string;
}

export interface GeneralBookingInfo {
    reservationBookingId: string;
    bookingFName: string;
    bookingLName: string;
    bookingEmail: string;
    bookingPhone: string;
    bookingDate: string;
    purchaseDate: string;
    bookingId: number;
    bookingAmount: BookingCartAmount;
    agentsGuestEmail?: string;
    isActive: boolean;
    partnerId: number;
    address: string;
    city: string;
    zip: string;
    countryId: number;
    stateId: number;
    accountType: string;
}

export function getGeneralBookingInfo(
    reservationBookingId: string,
    bookingDetails: BookingDetails,
    bookingAmount: BookingCartAmount
): GeneralBookingInfo {
    return {
        reservationBookingId: reservationBookingId,
        bookingFName: bookingDetails.bookingFName || '',
        bookingLName: bookingDetails.bookingLName || '',
        bookingEmail: bookingDetails.bookingEmail || '',
        bookingPhone: bookingDetails.bookingPhone || '',
        purchaseDate: bookingDetails.purchaseDate || '',
        bookingId: bookingDetails.bookingID || 0,
        bookingDate: bookingDetails.bookingDate || '',
        bookingAmount: bookingAmount,
        agentsGuestEmail: bookingDetails.agentsGuestEmail || '',
        isActive: bookingDetails.isActive || false,
        partnerId: bookingDetails.partnerId || 0,
        address: bookingDetails.address || '',
        city: bookingDetails.city || '',
        stateId: bookingDetails.stateid || 0,
        zip: bookingDetails.zip || '',
        countryId: bookingDetails.country || 0,
        accountType: bookingDetails.accountType,
    };
}
export function toModifyAdminBookingDetails(details: {
    generalBookingInfo?: GeneralBookingInfo;
    updatedBookings: {
        bookingDetails: BookingDetails;
        additionalDetails: TourInventoryDetails;
    }[];
    bookingNotes: string;
    passengerInformation?: PassengerInformation;
    agentInfo: {
        partnerId: number | null;
    };
    userId: string;
    chargeCreditCard?: {
        cardHolderName: string;
        cardNumber: string;
        cardCode: string;
        expirationDate: string;
    };
}): AdminUpdateBooking[] {
    return details.updatedBookings.map((booking) => ({
        reservationBookingId: booking.bookingDetails.reservationBookingId,
        bookingId: booking.bookingDetails.bookingID,
        tourInventoryId:
            booking.bookingDetails.tourInventoryID ||
            booking.additionalDetails.tourInventoryID ||
            0,
        adults: booking.bookingDetails.bookingAdults || 0,
        children: booking.bookingDetails.bookingChildren || 0,
        infant: booking.bookingDetails.bookingInfants || 0,
        leadFirstName: booking.bookingDetails.leadFirstName || '',
        leadLastName: booking.bookingDetails.leadLastName || '',
        pickUpLocation: booking.bookingDetails.bookingPickUp || '',
        shipCompanyId:
            booking.bookingDetails.shipCompanyId ||
            booking.additionalDetails.shipCompanyId ||
            null,
        shipId:
            booking.bookingDetails.shipId ||
            booking.additionalDetails.shipId ||
            null,
        bookingNotes: details.bookingNotes || '',
        bookingFirstName:
            details.passengerInformation?.firstName ||
            details.generalBookingInfo?.bookingFName ||
            '',
        bookingLastName:
            details.passengerInformation?.lastName ||
            details.generalBookingInfo?.bookingLName ||
            '',
        partnerId:
            details.agentInfo.partnerId ||
            details.generalBookingInfo?.partnerId ||
            0,
        email: details.generalBookingInfo?.bookingEmail || '', // this is not editable
        agentsGuestEmail:
            details.passengerInformation?.email ||
            details.generalBookingInfo?.agentsGuestEmail ||
            '',
        primaryPhoneNumber:
            details.passengerInformation?.phoneNumber ||
            details.generalBookingInfo?.bookingPhone ||
            '',

        createdBy: details.userId,

        // not currently supported
        serviceFee: null,
        adultPrice: null,
        childPrice: null,
        discountAmount: null,
        discountType: '',
        discountCode: '',
        refundAmount: null,
        participationNotes: '', // booking.bookingDetails.noShowComment || '',
        tourInventoryNotes: '', // booking.additionalDetails.specialNotes || '',
        paymentType:
            booking.bookingDetails.accountType?.toLowerCase() === 'invoicelater'
                ? 'InvoiceLater'
                : 'CreditCard',
        chargeCreditCard: details.chargeCreditCard || {
            cardHolderName: '',
            cardNumber: '',
            cardCode: '',
            expirationDate: '',
        },
    }));
}
export function toModifyBookingDetails(details: {
    generalBookingInfo?: GeneralBookingInfo;
    updatedBookings: {
        bookingDetails: BookingDetails;
        additionalDetails: TourInventoryDetails;
    }[];
    bookingNotes: string;
    passengerInformation?: PassengerInformation;
    agentInfo: {
        partnerId: number | null;
    };
    userId: string;
}): CompleteBookingDetails {
    return {
        reservationBookingId:
            details.updatedBookings[0].bookingDetails.reservationBookingId, // TODO: where this should be coming from
        bookingCart: details.updatedBookings.map((item) => {
            return {
                bookingId: item.bookingDetails.bookingID || 0,
                companyId: item.additionalDetails.companyUniqueID || '',
                shipCompanyId:
                    item.bookingDetails.shipCompanyId ||
                    item.additionalDetails.shipCompanyId ||
                    null,
                shipCompanyName:
                    item.bookingDetails.shipCompanyName ||
                    item.additionalDetails.shipCompanyName ||
                    '',
                shipId:
                    item.bookingDetails.shipId ||
                    item.additionalDetails.shipId ||
                    null,
                shipName:
                    item.bookingDetails.shipName ||
                    item.additionalDetails.shipName ||
                    '',
                tourId: item.additionalDetails.tourID || 0,
                bookingDate: item.bookingDetails.bookingDate || '',
                bookingTime: item.bookingDetails.bookingTime || '',
                tourInventoryId:
                    item.bookingDetails.tourInventoryID ||
                    item.additionalDetails.tourInventoryID ||
                    0,
                pickUpLocation: item.bookingDetails.bookingPickUp || '',
                adults: item.bookingDetails.bookingAdults || 0,
                children: item.bookingDetails.bookingChildren || 0,
                infants: item.bookingDetails.bookingInfants || 0,
                leadFirstName: item.bookingDetails.leadFirstName || '',
                leadLastName: item.bookingDetails.leadLastName || '',
                addons: [],
            };
        }),
        bookingNotes: details.bookingNotes || '',

        bookingFirstName:
            details.passengerInformation?.firstName ||
            details.generalBookingInfo?.bookingFName ||
            '',
        bookingLastName:
            details.passengerInformation?.lastName ||
            details.generalBookingInfo?.bookingLName ||
            '',
        email: details.generalBookingInfo?.bookingEmail || '', // this is not editable
        agentsGuestEmail:
            details.passengerInformation?.email ||
            details.generalBookingInfo?.agentsGuestEmail ||
            '',
        primaryPhoneNumber:
            details.passengerInformation?.phoneNumber ||
            details.generalBookingInfo?.bookingPhone ||
            '',
        secondaryPhoneNumber: '',
        shippingFirstName: '',
        shippingLastName: '',
        address: details.generalBookingInfo?.address || '',
        city: details.generalBookingInfo?.city || '',
        zipCode: details.generalBookingInfo?.zip || '',
        countryId: details.generalBookingInfo?.countryId || 0,
        stateId: details.generalBookingInfo?.stateId || 2,
        giftCardPIN: '',
        giftCardCode: '',
        discountId: 0,
        createdBy: details.userId || '',
        partnerId:
            details.agentInfo.partnerId ||
            details.generalBookingInfo?.partnerId ||
            0,
        paymentType: 'CreditCard', // TODO: this needs to be pulled from the API (its not currently being returned)
        chargeCreditCard: {
            cardHolderName: '',
            cardNumber: '',
            cardCode: '',
            expirationDate: '',
        },
    };
}

export interface AdditionalBookingDetails
    extends Omit<BookingDetails, 'bookingFname' | 'bookingLname'> {
    bookingFirstName: string;
    bookingLastName: string;
}

export interface BookingAmountDetail {
    id: number;
    bookingId: number;
    tourId: number;
    bookingAmount: number;
    tax: number;
    fee: number;
    discount: number;
    discountId?: string;
    totalCost: number;
    paymentId: number;
    refundAmount: number;
    shoppingCartImagePath: string;
    adultPrice: number;
    childrenPrice: number;
    cancellationReasonID?: string;
    notes?: string;
    discountName?: string;
    discountCode?: string;
    discountType?: string;
    discountPercentage?: string;
}

export interface BookingQRCodeList {
    bookingQRCodeID: number;
    usedDate?: string;
    cancelDate?: string;
    refundDate?: string;
    qrCodeName: string;
    isValid: boolean;
    isUsed: boolean;
    createdBy?: string;
    bookingQRCodeImagePath: string;
}

export interface TourInventoryDetails {
    tourInventoryID: number;
    companyUniqueID: string;
    tourID: number;
    tourName: string;
    description: string;
    shoppingCartImagePath: string;
    adultPrice: number;
    childPrice: number;
    physicalLevel: string;
    salesTax: number;
    isLiabilityReleaseRequired: boolean;
    isParticipantCannotBePregnant: boolean;
    isParticipantCannotHaveaBackInjury: boolean;
    tourServiceRefundPolicyId: number;
    shortDescription: string;
    whatsIncluded: string;
    whatsNotIncluded: string;
    shipCompanyId: number;
    shipCompanyName: string | null;
    shipId: number;
    shipName: string | null;
    tourInventoryDate: string; // "2023-06-11T00:00:00",
    tourInventoryTime: string; // "10:30:00",
    tourInventoryAllocatedSeats: number;
    portId: number;
    portName: string;
    partnerId: number;
    partnerName: string | null;
    shipInfo: string | null;
    shipInfoId: string | null;
    shipDataSource: string | null;
    pickupLocationID: number;
    pickupLocationName: string;
    pickupAddress: string;
    latitude: string;
    longitude: string;
    specialNotes: string;
}

export interface Booking {
    bookingID: number;
    tourInventoryID: number;
    bookingNumber: string;
    purchaseDateString?: string;
    bookingDateString: string;
    bookingTimeString: string;
    adults: number;
    children: number;
    infants: number;
    tourName: string;
    firstName: string;
    lastName: string;
    cruiseLineName: string;
    shipName: string;
    pickUp: string;
    phoneNumber: string;
    paymentType: string;
    bookingDate: string | null;
    bookingEmail: string;
    orderID: string;
    agentsGuestEmail?: string;
    isActive: boolean;
    remainingAmountAfterRefund: number;
    isFullyRefundable: boolean;
}

export interface BookingCartAmount {
    id: number;
    bookingId: number;
    tourId: number;
    shoppingCartImagePath: string;
    bookingAmount: number;
    tax: number;
    fee: number;
    discount: number;
    discountId: number | null;
    totalCost: number;
    paymentId: number;
    refundAmount: number;
    adultPrice: number;
    childrenPrice: number;
    cancellationReasonID: number | null;
    notes: string | null;
    adults: number | null;
    children: number | null;
    previousBookingId: number | null;
    discountName: string | null;
    discountCode: string | null;
    discountType: string | null;
    lastTotalCost: number;
    lastRefundAmount: number;
    discountPercentage: number | null;
    isAgent: boolean;
}

export interface AddOns {
    addonId: number;
    addons: number;
}

export interface GetBookingAmountDetailCart {
    tourId: number;
    adults: number;
    children: number;
    infants: number;
    addons: AddOns[];
}

export interface GetBookingAmountDetail {
    reservationBookingId: string;
    discountId: number;
    bookingCart: GetBookingAmountDetailCart[];
}
