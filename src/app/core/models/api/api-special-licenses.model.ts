export interface SpecialLicensesListItem {
    specialLicenseId: number;
    specialLicenseName: string;
    companyUniqueId: string;
    createdBy: number;
    createdDate: string;
    modifiedBy: number;
    modifiedDate: string;
    isActive: boolean;
    hasExpiry: boolean;
    isEmployeeApplicable: boolean;
    firstNotificationDate: number;
    secondNotificationDate: number;
    documentFile: string;
    userId: string;
    userEvaluationCoachingId: number;
    fromDate: string;
    type: string;
}

export interface SpecialLicensesConfig {
    specialLicenseId: number;
    specialLicenseName: string;
    documentFile: File;
    formPath: string;
    formFile: File;
    isActive: boolean;
    hasExpiry: boolean;
    fromDate: string;
    type: string;
    userId: string;
    companyId: string;
    userEvaluationCoachingId: number;
}
