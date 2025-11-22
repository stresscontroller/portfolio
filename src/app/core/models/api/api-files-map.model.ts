export interface ShipCompanyShipMapsItem {
    shipCompanyShipMapsId: number;
    cruiseLineShipName: string;
    shipName: string;
    companyUniqueID: string;
    shipCompanyId: number;

    // local addition
    shipCompanyName?: string;
}

export interface PortMapsItem {
    shipCompanyPortMapsId: number;
    cruiseLinePortName: string;
    portName: string;
    companyUniqueID: string;
    shipCompanyId: number;

    // local addition
    shipCompanyName?: string;
}

export interface TourMapsItem {
    shipCompanyTourMapsId: number;
    cruiseLineTourName: string;
    tourName: string;
    companyUniqueID: string;
    shipCompanyId: number;
    tourId: number;
    cruiseLineTourCode: string;

    // local addition
    shipCompanyName?: string;
}

export interface FileHeaderTextMapsItem {
    cruiseLineTourFileId: number;
    portName: string;
    shipName: string;
    cruiseLineTourName: string;
    startDateText: string;
    startTimeText: string;
    amountSoldText: string;
    shipCompanyId: number;
    headerRow: number;
    headerColumnCount: number;

    // local addition
    shipCompanyName?: string;
}

export interface UploadFileItem {
    shipCompanyId: number;
    shipCompanyName: string;
}
