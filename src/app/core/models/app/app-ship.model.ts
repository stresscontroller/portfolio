import { ApiShip } from '../api';

export interface ShipCompany {
    shipCompanyId: number;
    shipCompanyName: string;
    shipCompanyColor: string;
    shipCompanyBackgroundColor: string;
    dataSource: string;
}

export interface Ship {
    shipId: number;
    shipName: string;
}

export interface AppShip {
    shipCompanyId: number;
    shipCompanyName: string;
    shipCompanyAddress: string | null;
    shipCounts: number;
    isActive: boolean;
    lastModifiedDate: string | null;
    lastModifiedBy: string | null;
    createdDate: string | null;
    createdBy: string | null;
    companyUniqueId: string;
    shipCompanyLogo: string;
    dataSource: string;
    isLive: boolean;
    isLiveStr: string;
}

export interface ShipByTour {
    shipCompanyId: number | null;
    shipCompanyName: string;
    shipId: number | null;
    shipName: string;
}

export interface CruiseDate {
    refID: string;
    cruiseStartsInString: string;
    departureDate: string;
}

export function fromApiShips(ships: ApiShip[]): AppShip[] {
    return ships.map((ship) => fromApiShip(ship));
}

export function fromApiShip(ship: ApiShip): AppShip {
    return {
        shipCompanyId: ship.ShipCompanyId,
        shipCompanyName: ship.ShipCompanyName,
        shipCompanyAddress: ship.ShipCompanyAddress,
        shipCounts: ship.ShipCounts,
        isActive: ship.IsActive,
        lastModifiedDate: ship.LastModifiedDate,
        lastModifiedBy: ship.LastModifiedBy,
        createdDate: ship.CreatedDate,
        createdBy: ship.CreatedBy,
        companyUniqueId: ship.CompanyUniqueID,
        shipCompanyLogo: ship.ShipCompanyLogo,
        dataSource: ship.DataSource,
        isLive: ship.IsLive,
        isLiveStr: ship.IsLiveStr,
    };
}
