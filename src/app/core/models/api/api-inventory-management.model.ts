export interface UpdateBulkAllocatedUnallocatedInventories {
    maxCapacity: number;
    tourId: number;
    ids: string;
    userId: string;
    toTime: string;
}

export interface NeededAllocationUserPreference {
    id?: number;
    companyId: string;
    startDate: string; // e.g. "2024-03-28T03:14:03.673Z",
    endDate: string; // e.g. "2024-03-28T03:14:03.673Z",
    isUsePercentage: boolean;
    usePercentage: number;
    isUseSeats: boolean;
    useSeats: number;
}

export interface RecentlyReleasedInventory {
    unallocatedTourInventoryID: number; // 117076
    shipCompanyName: string; //"Princess Cruises"
    shipName: string; // "Sapphire Princess"
    tourName: string; // "Sled Dog Adventure in Skagway"
    portName: string; // "Skagway, Alaska"
    cruiseLineTourCode: string;
    unallocatedTourInventoryDate: string; //"2024-07-30T00:00:00",
    unallocatedTourInventoryTime: string; // "2:30PM",
    unallocatedTourInventoryAllocatedSeats: number;
}

export interface AllocationReleaseTourSearch {
    companyId: string;
    shipCompanyId?: number | null;
    shipId?: number | null;
    portId?: number;
    tourId: number;
    fromDate: string;
    toDate: string;
    fromTime: string;
    toTime: string;
    days: string; // e.g. '1,2,3,4'
    isBiWeekly: boolean;
}

export interface AllocationUnallocateTourSearch {
    searchType?: 'ALL' | 'A' | 'UA' | 'R';
    companyId: string;
    tourId?: string[]; // list of tourIds
    shipId?: number | null; // pass in 0 to return all ships
    shipCompanyId?: number | null; // pass in 0 to return all ships
    portId?: number | null; // pass in as empty string to return all ports
    isActive: boolean;
    startDate: string; // e.g. '2023-07-06' (YYYY-MM-DD)
    endDate: string; // e.g. '2023-07-06' (YYYY-MM-DD)
}

export interface InventoryMangagementItemExtended
    extends InventoryManagementItem {
    isIgnored?: boolean;
    isRemindLater?: boolean;
    reminderBeginDate?: string;
}

export interface InventoryManagementItem {
    unallocatedInventoryId: number;
    tourInventoryDateString: string;
    tourInventoryTimeString: string;
    portId: number;
    portName: string;
    tourID: number;
    shipCompanyId: number;
    shipId: number;
    shipName: string;
    tourName: string;
    threshold: number;
    seatSold: number;
    seatAllocated: number;
    companyId?: string;
}

export interface UserInventoryPrefence {
    companyId: string;
    startDate: string;
    endDate: string;
    isUsePercentage: boolean;
    usePercentage: number;
    isUseSeats: boolean;
    useSeats: number;
}

export interface AllocationUnallocatedTourInventoryListItem {
    companyId: string;
    searchType: string;
    tourId: string;
    shipCompanyId: number;
    shipId: number;
    startDate: string;
    endDate: string;
    fromTime: string;
    portId: number;
    isActive: boolean;
}

export interface AllocatedDataByFilter {
    companyId: string;
    shipId: number | null;
    tourId: number;
    portId: number;
    fromDate: string;
    toDate: string;
    fromTime: string;
    toTime: string;
    searchBy: string;
    days: string; // e.g. '1,2,3,4'
    isBiWeekly: boolean;
}

export interface AllocatedItem {
    shipId: number | null;
    shipCompanyId: number | null;
    ids: string;
    userId: string;
}

export interface UnallocatedTourInventoryItem {
    unallocatedTourInventoryID: number;
    shipCompanyId: number;
    shipId: number;
    companyId: string;
    portId: string | null;
    partnerId: number | null;
    recurranceId: number;
    createdBy: string;
}

export interface UnallocatedTourInventoryItemForm {
    unallocatedTourInventoryID?: number;
    tourID: number;
    startDate: string;
    recurranceId?: number;
    endDate: string | null;
    unallocatedTourInventoryDate: string;
    isRecurranceUpdate: boolean;
    unallocatedTourInventoryTime: string;
    unallocatedTourEndTime: string;
    unallocatedTourInventoryAllocatedSeats: number;
    isReleased: boolean;
    intervalHours: string;
    intervalMinutes: string;
    frequency: string;
    createdBy?: string;
    companyId: string;
    days?: string;
}

export interface UnallocatedTourInventoryTime {
    ticks: number;
    days: number;
    hours: number;
    milliseconds: number;
    minutes: number;
    seconds: number;
}

export interface UnallocatedTourEndTime {
    ticks: number;
    days: number;
    hours: number;
    milliseconds: number;
    minutes: number;
    seconds: number;
}

export interface NeededAllocationTourInventoryFilters {
    companyId?: string | null;
    tourIDs?: string[] | null;
    startDate: string;
    endDate: string;
    portId?: number | null;
    isUsePercentage?: boolean | null;
    usePercentage?: number | null;
    isUseSeats?: boolean | null;
    useSeats?: number | null;
}

export interface NeededAllocationTourInventoryDetailFilters {
    companyId?: string | null;
    tourId?: string | null;
    shipId?: string | null;
    startDate: string;
    portId?: number | null;
    isUsePercentage?: boolean | null;
    usePercentage?: number | null;
    isUseSeats?: boolean | null;
    useSeats?: number | null;
}

export interface NeededAllocationTourInventoryReminderItem {
    companyId: string;
    tourId: number;
    shipId: number;
    tourDate: string;
    isIgnored: boolean;
    isRemindLater: boolean;
    reminderBeginDate: string;
}

export interface ReleaseInventoryListItem {
    unallocatedTourInventoryID: number;
    unallocatedTourInventoryDate: string;
    tourInventoryDateString: string;
    unallocatedTourInventoryTime: string;
    unallocatedTourInventoryAllocatedSeats: number;
    shipCompanyName: string;
    shipName: string;
    tourName: string;
    portName: string;
    unallocatedTourInventoryTimeString: string;
}

export interface TourInventoryItemExtended extends TourInventoryItem {
    extras?: {
        seatsSold?: number;
        seatsAllocated?: number;
    };
}

export interface TourInventoryItem {
    unallocatedTourInventoryID: number;
    tourID: number;
    shipCompanyId: number | null;
    shipId: number | null;
    shipCompanyName: string;
    shipInfoId: number | null;
    unallocatedTourInventoryDate: string;
    tourInventoryDateString: string;
    tourInventoryDateddMMMyyyy: string | null;
    unallocatedTourInventoryTime: string;
    unallocatedTourEndTime: string | null;
    tourInventoryTimeString: string | null;
    unallocatedTourInventoryAllocatedSeats: number;
    companyId: string | null;
    isReleased: boolean | null;
    isActive: boolean;
    createdDate: string | null;
    createdBy: string | null;
    lastModifiedDate: string | null;
    lastModifiedBy: string | null;
    shipName: string;
    portId: number;
    partnerId: number | null;
    unallocatedTourInventoryTimeString: string;
    cruiseShipName: string | null;
    cruiseLineName: string | null;
    tourName: string;
    portName: string;
    partnerName: string | null;
    totalUnallocatedSeatTour: number | null;
    bookingChildren: number | null;
    bookingAdults: number | null;
    adultCost: number | null;
    childCost: number | null;
    capacity: number | null;
    frequency: string | null;
    intervalHours: number | null;
    intervalMinutes: number | null;
    startDate: string | null;
    endDate: string | null;
    totalBooking: number;
    id: number;
    color: string | null;
    backgroundColor: string | null;
    allDay: boolean;
    start: string | null;
    startString: string | null;
    url: string | null;
    title: string | null;
    description: string | null;
    className: string | null;
    recurranceId: number | null;
    isRecurranceUpdate: boolean;
    userId: number | null;
    seatsSold: number;
}

export interface ShipDataInfo {
    tourInventoryID: number;
    companyUniqueID: string | null;
    tourID: number;
    tourName: string | null;
    description: string | null;
    shoppingCartImagePath: string | null;
    adultPrice: number | null;
    childPrice: number | null;
    physicalLevel: string | null;
    salesTax: number | null;
    isLiabilityReleaseRequired: boolean;
    isParticipantCannotBePregnant: boolean;
    isParticipantCannotHaveaBackInjury: boolean;
    tourServiceRefundPolicyId: number;
    shortDescription: string | null;
    whatsIncluded: string | null;
    whatsNotIncluded: string | null;
    shipCompanyId: number;
    shipCompanyName: string | null;
    shipId: number;
    shipName: string | null;
    tourInventoryDate: string; // You may want to use a Date type here
    tourInventoryTime: string;
    tourInventoryAllocatedSeats: number;
    portId: number;
    portName: string | null;
    partnerId: number;
    partnerName: string | null;
    shipInfo: string;
    shipInfoId: string;
    shipDataSource: string;
    pickupLocationID: number | null;
    pickupLocationName: string | null;
    pickupAddress: string | null;
    latitude: number | null;
    longitude: number | null;
}
