export type EditInventorySearch = AllocationDeleteSearch;

export interface AllocationDeleteSearch extends AllocationAllocatedSearch {
    searchBy: 'ALL' | 'A' | 'UA' | 'R';
}

export interface AllocationAllocatedSearch {
    shipCompanyId?: number | null;
    shipId: number | null;
    tourId: number | null;
    portId: number;
    fromDate: string;
    toDate: string;
    fromTime: string;
    toTime: string;
    days: string; // e.g. '1,2,3,4'
    isBiWeekly: boolean;
    isShipScheduleTimeLimitOverride?: boolean | null;
}

export interface NeedingAllocationSelectedInventory {
    // tour values
    companyId: string;
    tourId: number;
    tourName: string;
    portId: number;
    portName: string;
    shipId: number;
    shipName: string;
    shipCompanyId: number;
    threshold: number;
    seatSold: number;
    seatAllocated: number;
    tourDate: string; // YYYY-MM-dd

    // filter values
    usePercentage: number;
    isUseSeats: boolean;
    isUsePercentage: boolean;
    useSeats: number;
}
