export interface ApiShip {
    ShipCompanyId: number;
    ShipCompanyName: string;
    ShipCompanyAddress: string | null;
    ShipCounts: number;
    IsActive: boolean;
    LastModifiedDate: string | null;
    LastModifiedBy: string | null;
    CreatedDate: string | null;
    CreatedBy: string | null;
    CompanyUniqueID: string;
    ShipCompanyLogo: string;
    DataSource: string;
    IsLive: boolean;
    IsLiveStr: string;
}

/**
 * Example:
     {
        ShipCompanyId: 1,
        ShipCompanyName: 'Carnival Cruise Lines',
        ShipCompanyAddress: null,
        ShipCounts: 0,
        IsActive: true,
        LastModifiedDate: null,
        LastModifiedBy: null,
        CreatedDate: '/Date(1611337489500)/',
        CreatedBy: null,
        CompanyUniqueID: '72aca93d-62a8-48e8-abf5-9814dc7604ae',
        ShipCompanyLogo:
            '/carnival-cruise-lines-operator_Carnival Cruise Lines.png',
        DataSource: 'WIDGETY-API',
        IsLive: false,
        IsLiveStr: 'NO',
    }
 */
