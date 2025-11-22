export interface CruiseEvents {
    id: number;
    color: string;
    backgroundColor: string;
    allDay: false;
    start: string;
    end: string | null;
    title: string;
    description: string;
    className: string;
    url: string;
    portId: number;
    shipId: number;
    shipCompanyId: number;
    tourInventoryAllocatedSeats: number;
    totalBooking: number;
    dockId: number | null;
    seatsSold: number;
    shipCapacity: number;
    meta?: CruiseEventMeta;
}

export interface CruiseEventMeta {
    cruiseLine: string;
    cruiseTime: string;
    dockAssignment: string;
}

export interface Docks {
    dockId: number;
    dockName: string;
    isActive: boolean | null;
    companyUniqueID: string;
    portId: number;
    portName: string;
    label: string | null;
}

export interface DTDdockDetails {
    companyUniqueID: string;
    portId: number;
    assignmentDate: string;
    shipId: number;
    dockId: number;
    dockName: string;
}

export interface Port {
    portId: number;
    portName: string;
    companyUniqueID: string | null;
    isActive: boolean;
    createDate: string | null;
    createBy: string | null;
    lastModifiedDate: string | null;
    lastModifiedBy: string | null;
    mapFileName: string | null;
    mapFilePath: string | null;
    country: string | null;
    isDefault: boolean;
    region: string;
}

export interface Region {
    value: number;
    text: string;
}
export interface AvailableDate {
    tour_inventory_date: string;
}
