export interface TourImage {
    id: number;
    imagePath: string;
    position: string;
    shoppingCartImagePath: string | null;
    isHeader: string | null;
    isShoppingCart: boolean;
}

export interface TourItinerary {
    tourItineraryId: number;
    orderNo: number;
    description: string;
    transportationType: string;
    time: string; // 35 minutes"
}

export interface TourTimes {
    tourInventoryTime: string; // "10:00:00"
    tourInventoryId: number;
    availableSeats: number;
    tourInventoryAllocatedSeats: number;
}

export interface TourInventory {
    tourInventoryID: number;
    tourInventoryDate: string;
    tourName: string;
    duration: string;
    physicalLevel: string;
    adultPrice: string;
    description: string;
    shortDescription: string;
    shortDuration: string;
    portName: string;
    shoppingCartImagePath: string;
    totalRating: number;
    averageRating: number;
    showMore?: boolean;
    companyUniqueID: string;
}

export interface TourSaveConfig {
    tourId: number;
    tourName: string;
    tourShortName: string;
    unitInMeter: string;
    companyId: string;
    createdBy: string;
    description: string;
    maxCapacity: number;
    minCapacity: number;
    adultPrice: number;
    childPrice: number;
    minAge: number;
    minWeight: number;
    maxWeight: number;
    physicalLevel: string;
    duration: string;
    calendarColor: string;
    minHeight: number;
    salesTax: number;
    isLiabilityReleaseRequired: boolean;
    isParticipantCannotBePregnant: boolean;
    isParticipantCannotHaveaBackInjury: boolean;
    shortDescription: string;
    portId: number;
    faqCategories: string;
}
export interface TourDetails {
    tourId: number;
    tourCode: string;
    tourName: string;
    tourShortName: string;
    description: string;
    adultPrice: number;
    childPrice: number;
    physicalLevel: string;
    duration: string; // "03:30:00";
    salesTax: number;
    serviceFee: number;
    isLiabilityReleaseRequired: boolean;
    isParticipantCannotBePregnant: boolean;
    isParticipantCannotHaveaBackInjury: boolean;
    tourServiceRefundPolicyId: number;
    shortDescription: string;
    whatsIncluded: string;
    whatsNotIncluded: string;
    shoppingCartImagePath: string;
    tourImageList: TourImage[];
    tourVideo: TourVideoItem;
    tourItineraryList: TourItinerary[];
    faqCategoryList: FaqCategoryListItem[];
    minWeight: number;
    maxWeight: number;
    minHeight: number;
    minAge: number;
    defaultMeasurementUnit: string;
    companyUniqueID: string | null;
    portId?: number;
    portName?: string;
}

export interface RefundPolicy {
    tourServiceRefundPolicyId: number;
    refundPolicyName: string;
    description: string;
    durationType: string; // Adjust as needed
    durationAmount: number;
    refundAmount: number;
    refundType: string; // Adjust as needed
    isActive: boolean;
}

export interface TourPriceDetails {
    id: number;
    tourId: number;
    startDate: Date;
    adultPrice: number;
    childPrice: number | null;
    isActive: boolean;
}

export interface TourPriceDetailsConfig {
    id: number;
    tourId: number;
    startDate: string;
    adultPrice: number;
    childPrice: number;
    createdBy: string;
}

export interface FaqCategoryListItem {
    tourFaqCategoryId: number;
    companyId: string;
    categoryId: number;
    tourId: number;
    isActive: boolean;
    createdDate: string;
}

export interface FAQCategory {
    faqCategoryId: number;
    companyId: string;
    categoryName: string;
    isActive: boolean;
    createdDate: Date;
    isGeneral: boolean;
    questionAnswers: FAQQuestionItem[];
}
export interface FAQQuestionItem {
    faqQuestionAnswerId: number;
    companyId: string;
    question: string;
    answer: string;
    categoryId: number;
    isActive: boolean;
    createdDate: Date;
}

export interface AddOnsItem {
    addonsId: number;
    name: string;
    price: number;
    tax: number;
    photo: string;
}

export interface TourVideoItem {
    id: number;
    videoPath: string;
}

export interface TourItem {
    adultPrice: number;
    childPrice: number;
    calendarColor: string;
    companyUniqueID: string;
    defaultMeasurementUnit: string;
    description: string;
    duration: string;
    durationAmount: number;
    durationType: string;
    faqCategoryList: FaqCategoryListItem[];
    isLiabilityReleaseRequired: boolean;
    isParticipantCannotBePregnant: boolean;
    isParticipantCannotHaveaBackInjury: boolean;
    maxWeight: number;
    minAge: number;
    minHeight: number;
    minWeight: number;
    physicalLevel: string;
    portId: number;
    refundAmount: number;
    refundPolicyDescription: string;
    refundPolicyName: string;
    refundType: string;
    salesTax: number;
    serviceFee: number;
    shoppingCartImagePath: string;
    shortDescription: string;
    tourCode: string;
    tourId: number;
    tourImageList: TourImage[];
    tourVideo?: TourVideoItem;
    tourItineraryList: TourItinerary[];
    tourName: string;
    tourServiceRefundPolicyId: number;
    tourShortName: string;
    whatsIncluded: string;
    whatsNotIncluded: string;
}
export interface TourDetailsConfig {
    tourName: string;
    physicalLevel: string;
    duration: string;
    portId: number;
    faqCategoryList: number[];
    minWeight: number;
    maxWeight: number;
    minHeight: number;
    minAge: number;
    minCapacity: number;
    maxCapacity: number;
    adultPrice: number;
    childPrice: number;
    salesTax: number;
    addOns: number[];
    description: string;
    shortDescription: string;

    tourShortName: string;
    unitInMeter: string;
    isLiabilityReleaseRequired: boolean;
    isParticipantCannotBePregnant: boolean;
    isParticipantCannotHaveaBackInjury: boolean;
    calendarColor: string;
}

export interface SaveTourDetailsConfig {
    tourId: number;
    TourName: string;
    tourShortName: string;
    unitInMeter: string;
    companyId: string;
    createdBy: string;
    description: string;
    maxCapacity: number;
    minCapacity: number;
    adultPrice: number;
    childPrice: number;
    minAge: number;
    minWeight: number;
    maxWeight: number;
    physicalLevel: string;
    duration: string;
    calendarColor: string;
    minHeight: number;
    salesTax: number;
    isLiabilityReleaseRequired: boolean;
    isParticipantCannotBePregnant: boolean;
    isParticipantCannotHaveaBackInjury: boolean;
    shortDescription: string;
    portId: number;
    FAQCategories: string;
}

export interface TourDeleteConfig {
    tourId: number;
    isActive: boolean;
    createdBy: string;
}

export interface PolicyConfig {
    tourId: number;
    tourServiceRefundPolicyId: number;
    createdBy?: string;
}

export interface TourInventoryUpdate {
    tourInventoryId: number;
    companyUniqueID: string;
    tourId: number;
    shipCompanyId: number | null;
    shipId: number | null;
    tourInventoryDate: string; // "2024-07-25",
    tourInventoryTime: string; //"10:00:00",
    tourInventoryAllocatedSeats: number;
    partnerId: number | null;
    specialNotes: string;
    createdBy: string;
}
