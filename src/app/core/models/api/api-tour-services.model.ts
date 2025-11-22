export interface TourServiceDetailsConfig {
    tourId: number;
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

export interface TourServiceRefundPolicyConfig {
    tourId: number;
    tourServiceRefundPolicyId: number;
    createdBy: string;
}

export interface TourServiceItineraryConfig {
    tourItineraryId?: number;
    tourId: number;
    description: string;
    transportationType: string;
    time: string;
    createdBy?: string;
    orderNo: number;
}

export interface TourServiceItineraryListConfig {
    createdBy?: string;
    tourItineraryList: TourServiceItineraryListItems[];
}

export interface TourServiceItineraryListItems {
    tourItineraryId?: number;
    tourId: number;
    description: string;
    transportationType: string;
    time: string;
    orderNo: number;
}

export interface TourServiceIncludedConfig {
    tourId: number;
    whatsIncluded: string;
    whatsNotIncluded: string;
    createdBy: string;
}

export interface TourGalleryItem {
    id: number;
    tourId: number;
    imagePath: string;
    position: number;
    isHeader: boolean;
    isShoppingCart: boolean;
    shoppingCartImagePath: string;
}

export interface TourGalleryImageConfig {
    id: number;
    tourId: number;
    imagePath: string;
    position: number;
    isHeader: boolean;
    isShoppingCart: boolean;
    shoppingCartImagePath: string;
    shoppingCartImagePathURL: string;
    companyId: string;
    createdBy: string;
}

export interface TourServiceItineraryConfig {
    tourItineraryId?: number;
    tourId: number;
    description: string;
    transportationType: string;
    time: string;
    createdBy?: string;
}

export interface TourIncludedItem {
    index: number;
    description: string;
    type: string;
}
export interface TourServiceIncludedConfig {
    tourId: number;
    whatsIncluded: string;
    whatsNotIncluded: string;
    createdBy: string;
}
