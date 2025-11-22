export interface PayrollListItem {
    userPayRollId: number;
    userId: number;
    companyId: number;
    locationId: number;
    startDate: string | null;
    arrivalDate: string | null;
    companyEmail: string | null;
    employeeFirstDay: string | null;
    employeeLastDay: string | null;
    isEligibleForRehire: boolean;
    isHired: boolean;
    payRatesList: PayRatesModel[];
}

export interface PayRatesModel {
    payRateId: number;
    positionId: number | null;
    departmentId: number | null;
    payRate: number | null;
}

export interface PositionInfo {
    location: number;
    startDate: string | Date;
    arrivalDate: string | Date;
}

export interface DepartmentInfo {
    companyEmail: string | undefined;
    employeeFirstDay: string | Date;
    employeeLastDay: string | Date;
}

export interface PayRatesInfo {
    userPayRollId: number;
    isEligibleForRehire: boolean;
    isHired: boolean;
    payRatesList: PayRatesModel[];
}

export interface PayrollItemConfig {
    userPayRollId: number;
    userId: string;
    companyId: string;
    locationId: number;
    startDate: string;
    arrivalDate: string | null;
    companyEmail: string;
    employeeFirstDay: string;
    employeeLastDay: string | null;
    isEligibleForRehire: boolean;
    isHired: boolean;
    payRatesList: PayRatesModel[];
}
