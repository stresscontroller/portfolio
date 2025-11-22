export interface Qualification {
    qualificationId: number;
    qualificationName: string;
    companyUniqueId: string;
    createdBy: string | null;
    createdDate: Date | null;
    modifiedBy: string | null;
    modifiedDate: Date | null;
    isActive: boolean;
    qualificationType: string;
    hasExpiry: boolean;
    isEmployeeApplicable: boolean;
    firstNotificationDate: number;
    secondNotificationDate: number;
}

export interface UserQualificationListItem {
    userQualificationLicenseId: number;
    typeName: string;
    typeId: number;
    displayName: string;
    fromDate: string;
    expireDate: string;
    isNeverExpire: boolean;
    documentPath: string;
    userid: string;
    companyUniqueId: string;
    documentFile: File | null;
    isActive: boolean;
}

export interface UserQualificationConfig {
    userQualificationLicenseId: number;
    typeName: string;
    typeId: number;
    displayName: string;
    fromDate: string;
    expireDate: string;
    isNeverExpire: boolean;
    isActive: boolean;
    userid: string;
    companyUniqueId: string;
    documentFile: File | null;
    documentPath: string | null;
}

export interface LicenseOptions {
    companyUniqueID: string;
    isActive: boolean;
    createdDate: string | null;
    modifiedDate: string | null;
    hasExpiry: boolean;
    firstNotificationDate: string | null;
    secondNotificationDate: string | null;
    eplicable: boolean; // Assuming this is a typo and should be something like 'applicable'
    applicable: boolean;
    department: string | null;
    departmentId: string | null;
    positionId: string | null;
    position: string | null;
    noStaffNeeded: number | null;
    isManager: boolean | null;
    payRateId: string | null;
    payRate: number | null;
    payRateString: string;
    maxPayRate: number | null;
    maxPayRateString: string;
    payrateYear: number | null;
    payRateYearId: number;
    payType: string | null;
    maxPayType: string | null;
    locationId: string | null;
    location: string | null;
    locationType: string | null;
    latitude: number | null;
    longitude: number | null;
    locationAddress: string | null;
    qualificationId: string | null;
    qualification: string | null;
    qualificationType: string | null;
    specialLicenseId: number;
    specialLicense: string;
    trainingId: string | null;
    training: string | null;
    evaluation: string | null;
    evaluationId: string | null;
}
