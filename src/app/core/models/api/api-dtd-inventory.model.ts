export interface ApiCancelTourInventory {
    tourInventoryId: number;
    cancellationReason: number;
    cancellationReasonNotes: string;
}

export interface ApiLinkTourInventory {
    tourInventoryFromId: number;
    tourInventoryToId: number;
    guestCounts: number;
    notes: string;
}

// post data
export interface ApiTourInventoryDTDAssignmentModel {
    tourInventoryId: number;
    dtdAssignmentGuideId: number | null;
    equipmentNumber: number | null;
    actualAdults: number | null;
    actualChildren: number | null;
    cruiseLineEscorts: number | null;
    createdBy: string;
    specialNotes: string;
    payingAdditionalGuests: number | null;
    isClosed?: boolean;
    final: number | null;
    dtdAssignmentTransportationId?: number | null;
    isFinalOnlyUpdate?: boolean;
    isOpen?: boolean;
}

// response data
export interface ApiTourInventoryDTDAssignmentDetails {
    tourInventoryID: number;
    tourID: number;
    shipCompanyId: number;
    shipId: number;
    tourInventoryDate: string;
    tourInventoryTime: string;
    tourInventoryAllocatedSeats: number;
    companyUniqueID: string;
    isActive: boolean;
    createdDate: string;
    createdBy: string;
    lastModifiedDate: string;
    lastModifiedBy: string;
    portId: number;
    partnerId: null;
    dtdAssignmentGuideVariableId: null;
    specialNotes: string;
    dtdAssignmentGuideId: number;
    actualAdults: number;
    actualChildren: number;
    payingAdditionalGuests: number;
    isClosed: boolean;
    isOpen: boolean;
    cruiseLineEscorts: number;
}

// post data
export interface ApiTourInventoryDTDAssignmentPrelimData {
    tourInventoryId: number;
    dtdAssignmentGuideId: number;
    actualAdults: number | null;
    actualChildren: number | null;
    cruiseLineEscorts: number | null;
    createdBy: string;
    specialNotes: string;
    payingAdditionalGuests: number | null;
    isClosed: boolean;
    prelim: number | null;
    isPrelimOnlyUpdate: boolean;
}

export interface ApiTourInventoryDTDAssignmentFinalData {
    tourInventoryId: number;
    dtdAssignmentGuideId: number;
    actualAdults: number | null;
    actualChildren: number | null;
    cruiseLineEscorts: number | null;
    createdBy: string;
    specialNotes: string;
    payingAdditionalGuests: number | null;
    isClosed: boolean;
    final: number | null;
    isFinalOnlyUpdate: boolean;
    equipmentNumber: number | null;
}

// response data
export interface ApiTourInventoryDTDAssignmentPrelimDetails {
    id: number;
    tourInventoryID: number;
    adults: number;
    children: number;
    adultsPrice: number;
    childrenPrice: number;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: null;
    lastModifiedDate: null;
    finalAdults: number;
    finalChildren: null;
}

// post data
export interface ApiPrelimListData {
    companyUniqueId: string;
    // 10/05/2023 format
    assignmentDate: string;
    shipCompanyId: number | null;
    shipId: number | null;
}

// response data
export interface ApiDTDAssignmentPrelimList {
    companyName: string;
    tourInventoryID: number;
    tourInventoryTime: string;
    tourInventoryAllocatedSeats: number;
    tourTime: null;
    shipName: string;
    tourName: string;
    preLim: number;
    final: number;
    actualTotal: number;
    actualAdults: number;
    actualChildren: number;
    cruiseLineEscorts: null;
    transportation: null;
    guideName: null;
    guideFullName: null;
    dockName: null;
    dtdAssignmentGuideVariableId: number;
    dtdAssignmentGuideId: number;
    payingAdditionalGuests: number;
    specialNotes: null;
    bookingFName: null;
    bookingLName: null;
    bookingAdults: number;
    bookingChildren: number;
    bookingEmail: null;
    bookingPhone: null;
    partnerId: null;
    totalBooked: number;
    isClosed: boolean;
    isOpen: boolean;
    mobleViewColumn: null;
    total: number;
}

export interface ApiTourManagementList {
    tourId: number | null;
    tourCode: string;
    tourName: string;
    languageId: string | null;
    isActive: boolean | null;
    distanceToPlayMedia: string | null;
    unitInMeter: string | null;
    defaultTourName: string | null;
    listTourslanguages: string | null;
    languageIds: string | null;
    uploadMap: string | null;
    listLanguageName: string | null;
    listTourMapModel: string | null;
    listDefaultLanguageModel: string | null;
    createdDate: string | null;
    companyUniqueID: string | null;
    listProductDetail: string | null;
    productItemID: string | null;
    isAudioTour: boolean | null;
    isDeleted: boolean | null;
    mapImage: string | null;
    portId: number;
}

export interface NewOTCBookingItem {
    bookingId: number;
    shipCompanyId: number | null;
    shipId: number;
    pickUpLocation: string;
    bookingFirstName: string;
    bookingLastName: string;
    email: string;
    primaryPhoneNumber: string;
    bookingNotes: string;
    createdBy: string;
    partnerId: number;
    agentsGuestEmail: string;
    companyUniqueID: string;
    tourId: number;
    bookingDate: string; // "2023-12-19T04:27:06.406Z",
    bookingTime: string;
    tourInventoryId: number;
    adults: number;
    children: number;
    infants: number;
    leadFirstName: string;
    leadLastName: string;
    paymentType: string;
    isOTC: boolean;
    isComplimentary: boolean;
}

export interface OTCBookingItem {
    tourInventoryID: number;
    bookingId: number;
    bookingEmail: string;
    agentsGuestEmail: string | null;
    firstName: string;
    lastName: string;
    leadFirstName: string;
    leadLastName: string;
    shipName: string | null;
    shipId: number | null;
    shipCompanyId: number | null;
    bookingNumber: string;
    group: string | null;
    adults: number;
    children: number;
    infants: number;
    totalBooked: number;
    currentCount: number;
    bookingPickUp: string | null; // e.g. "PL-4"
    pickUp: string;
    pickupLocationName: string;
    phoneNumber: string | null;
    notes: string;
    dockNotes: string;
    checkedIn: string;
    waiverCompleted: string;
    isOTC: boolean;
    isNoShow: boolean;
    showCount: number;
    partner_AgentName: string;
    partnerName: string;
    agentName: string;
    agentId: number | null;
    noShowComment: string | null;
    isComplimentary: boolean;
    isCheckedIn: boolean;
}

export interface DTDAssignmentListParam {
    companyId: string;
    assignmentDate: string; // e.g. "2023-12-13T10:00:45.929Z",
    email: string;
    portIds?: string[];
    tourIds?: string[];
    driverId?: number;
    dockId?: number;
    sortColumn?: string;
    sortDirection?: string;
    shipCompanyId?: number;
    shipId?: number;
    currentDateTime?: string;
}

export interface AssignmentParticipationItem {
    bookingId: number;
    totalBooked: number;
    noShowComment: string;
}

export interface DTDFilterPreference {
    companyId: string;
    portIds: string;
    tourIds: string;
    createdBy: string;
}

export interface TourInventoryDTDAssignmentSpecialNotesModel {
    tourInventoryId: number;
    createdBy: string;
    specialNotes: string;
}

export interface DtdTourTime {
    tourInventoryTime: string; // "10:00:00"
    tourInventoryId: number;
    availableSeats: number;
    tourInventoryAllocatedSeats: number;
    shipCompanyId: number | null;
    shipId: number | null;
    cruiseLineName: string;
    cruiseShipName: string;
}

export interface NewBookingImage {
    bookingId: number;
    bookingImage: File;
    bookingImagePath: string;
    createdBy: string;
    imageId: string;
}

export interface BookingImage {
    id: number;
    bookingID: number;
    imagePath: string;
    imageId: string;
}
