export interface Tour {
    tourId: number;
    tourCode: string;
    tourName: string;
    languageId: string | null;
    isActive: boolean;
    distanceToPlayMedia: string | null;
    unitInMeter: string | null;
    defaultTourName: string | null;
    languageIds: string | null;
    uploadMap: string | null;
    createdDate: string | null;
    companyUniqueID: string | null;
    productItemID: string | null;
    isAudioTour: string | null;
    isDeleted: string | null;
    mapImage: string | null;
    portId: number;
}
