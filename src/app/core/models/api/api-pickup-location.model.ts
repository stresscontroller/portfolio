export interface ApiPickupLocation {
    PickupLocationID: string;
    PickupLocationName: string;
    CompanyUniqueId: string | null;
    IsActive: boolean | null;
    CreatedDate: string | null;
    CreatedBy: string | null;
    LastModifiedDate: string | null;
    LastModifiedBy: string | null;
    latitude: number | null;
    longitude: number | null;
    MapFilePath: string | null;
    MapAddress: string | null;
    DefaultForNotArrivingByCruise: boolean | null;
    DefaultForArrivingByCruise: boolean | null;
}

/**
 * Example:
     {
        PickupLocationID: 'PL-3',
        PickupLocationName: 'Base of Tram - Juneau, Alaska',
        CompanyUniqueId: null,
        IsActive: null,
        CreatedDate: null,
        CreatedBy: null,
        LastModifiedDate: null,
        LastModifiedBy: null,
        latitude: null,
        longitude: null,
        MapFilePath: null,
        MapAddress: null,
        DefaultForNotArrivingByCruise: null,
        DefaultForArrivingByCruise: null,
    }
 */
