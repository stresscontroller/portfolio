import { LocationData } from '@app/core';

export interface HousingDataItem {
    userHousingId: number;
    userid: string;
    housingLocation: number;
    weeklyRent: string;
    numberOfPets: number;
    petsDeposit: string;
    moveInDate: string;
    notes: string;
    createdDate: string;
    modifiedDate: string;
    isActive: boolean;
    housingLocationList: LocationData;
}

export interface HousingDataConfig {
    userId: string;
    housingLocationName: number;
    weeklyRent: string;
    numPets: number;
    petDeposit: string;
    moveInDate: string;
    housingNotes: string;
}
