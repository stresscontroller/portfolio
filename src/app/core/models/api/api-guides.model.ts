export interface ApiGuide {
    GuideId: number;
    UserId: string;
    TransportationId: number;
    TransportationName: string;
    IsActive: boolean;
    CompanyUniqueID: string;
    GuideFullName: string;
    GuideFullNameText: string;
    GuideText: string;
    GuideText30: string;
    Capacity: number;
}

export interface ApiEquipmentItem {
    equipmentID: number;
    equipmentNumber: string;
    equipmentDescription: string;
    equipmentType: string;
    maxCapacity: number;
    isAvailable: boolean;
}

/**
 * Example:
    {
        GuideId: 7,
        UserId: '012a46f8-d10d-46a6-9967-9eb77196af4a',
        TransportationId: 1,
        TransportationName: 'Bus 1',
        IsActive: true,
        CompanyUniqueID: '00000000-0000-0000-0000-000000000000',
        GuideFullName: 'Alexis Applegate',
        GuideFullNameText: 'Alexis Applegate - Bus 1 25 pass',
        GuideText: 'Alexis - Bus 1 25 pass',
        GuideText30: 'Alexis - Bus 1 25 pass',
        Capacity: 25,
    },
 */
