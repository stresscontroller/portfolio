export interface CountryList {
    countryName: string;
    countryCode: string;
    countryId: number;
}

export interface StatesList {
    stateId: number;
    countryId: number;
    stateName: string;
}
