export interface CurrencyListItem {
    currencyId: number;
    currencyName: string;
    currencySymbol: string;
    currencyCode: string;
    isActive: boolean;
}

export interface TimeZoneListItem {
    timeZoneId: number;
    timeZoneName: string;
    utcOffset: string;
    isActive: boolean;
}

export interface CompanyInfo {
    companyID: number;
    companyUniqueID: string;
    companyName: string;
    companyPassCode: string;
    isActive: boolean;
    lastModifiedDate: string;
    lastModifiedBy: string | null;
    createdDate: string | null;
    createdBy: string | null;
    administrator: string;
    isMasterCompany: boolean;
    companyLogo: string;
    address: string;
    address2: string;
    country: number;
    state: number;
    zip: string;
    generalPhone: string;
    customerService: string;
    fax: string;
    email: string;
    facebookURL: string;
    intagramHandle: string;
    twitterURL: string;
    defaultPortId: number;
    strCompanyID: string | null;
    companyWebsite: string;
    companyDescription: string;
    defaultMeasurementUnit: string;
    defaultCCY: string;
    defaultCCY_Symbol: string | null;
    timeZone: string;
}

export interface CompanyInfoConfig {
    companyID: number;
    companyUniqueID: string;
    companyName: string;
    companyPassCode: string;
    isActive: boolean;
    lastModifiedDate: string;
    lastModifiedBy: string;
    createdDate: string;
    createdBy: string;
    administrator: string;
    isMasterCompany: boolean;
    companyLogo: string;
    address: string;
    address2: string;
    country: number;
    state: number;
    zip: string;
    generalPhone: string;
    customerService: string;
    fax: string;
    email: string;
    facebookURL: string;
    intagramHandle: string;
    twitterURL: string;
    defaultPortId: number;
    strCompanyID: string;
    companyWebsite: string;
    companyDescription: string;
    defaultMeasurementUnit: string;
    defaultCCY: string;
    defaultCCY_Symbol: string;
    timeZone: string;
}

export interface CompanyDepartmentListItem {
    departmentId: number;
    departmentName: string;
    companyUniqueId: string;
    createdBy: string | null;
    createdDate: string | null;
    modifiedBy: string | null;
    modifiedDate: string;
    isActive: boolean;
    parentDepartmentId: number;
    excelDepartmentId: number;
    id: string;
    text: string;
    parent: string;
    children: CompanyDepartmentListItem[] | null;
    isManager: boolean | null;
    postionId: number | null;
}

export interface CompanyDepartmentConfig {
    departmentId: number;
    departmentName: string;
    parentDepartmentId: number;
    companyUniqueId: string;
}

export interface CompanyPositionListItem {
    positionId: number;
    excelPositionId: number;
    positionName: string;
    companyUniqueId: string;
    createdBy: string | null;
    createdDate: string;
    modifiedBy: string | null;
    modifiedDate: string;
    isActive: boolean;
    departmentId: number;
    parentDepartmentId: number | null;
    departmentName: string;
    managerPositionId: number;
    excelManagerPositionId: number | null;
    managerPositionName: string | null;
    isManager: boolean;
    isRootLevel: boolean | null;
    numberofStaffNeeded: number;
    numberofPositionFilled: number;
    index: number;
    children: CompanyPositionListItem[] | null;
    departmentList: CompanyDepartmentListItem[] | null;
    shortDesc: string | null;
    longDesc: string | null;
    requirements: string | null;
    reportsTo: string | null;
    locationID: number | null;
    positionType: string | null;
    isJobExistByPositionId: boolean;
    defaultPayRate: number;
}

export interface CompanyPositionDetail {
    positionId: number;
    excelPositionId: number;
    positionName: string;
    companyUniqueId: string;
    createdBy: string;
    createdDate: string;
    modifiedBy: string;
    modifiedDate: string;
    isActive: boolean;
    departmentId: number;
    parentDepartmentId: number;
    departmentName: string;
    managerPositionId: number;
    excelManagerPositionId: number;
    managerPositionName: string;
    isManager: boolean;
    isRootLevel: boolean;
    numberofStaffNeeded: number;
    numberofPositionFilled: number;
    index: number;
    children: CompanyPositionListItem[];
    departmentList: CompanyDepartmentListItem[];
    shortDesc: string;
    longDesc: string;
    requirements: string;
    reportsTo: number;
    locationID: number;
    positionType: string;
    isJobExistByPositionId: boolean;
    defaultPayRate: number;
}

export interface CompanyPositionConfig {
    positionId: number;
    positionName: string;
    companyUniqueId: string;
    locationID: number;
    positionType: string;
    departmentId: number;
    managerPositionId: number;
    isManager: boolean;
    isRootLevel: boolean;
    numberofStaffNeeded: number;
    shortDesc: string;
    longDesc: string;
    requirements: string;
    createdBy: string;
}

export interface PayRateListItem {
    payRateMasterId: number;
    payRateAmount: number;
    positionId: number;
    payrateYear: string;
    maxPayRateAmount: number;
    payType: string;
    maxPayType: string;
}

export interface PayRateConfig {
    payRateMasterId: number;
    payRateAmount: number;
    positionId: number;
    payrateYear: string;
    maxPayRateAmount: number;
    payType: string;
    maxPayType: string;
    companyUniqueId: string;
}

export interface CompanyLocationListItem {
    companyUniqueId: string;
    createdBy: string | null;
    createdDate: string;
    isActive: boolean;
    latitude: number;
    locationAddress: string;
    locationId: number;
    locationName: string;
    locationType: string;
    longitude: number;
    modifiedBy: string | null;
    modifiedDate: string;
}

export interface CompanySpecialLicenseListItem {
    specialLicenseId: number;
    specialLicenseName: string;
    companyUniqueId: string;
    isActive: boolean;
    hasExpiry: boolean | null;
    isEmployeeApplicable: boolean | null;
    firstNotificationDate: number | null;
    secondNotificationDate: number | null;
    documentFile: string | null;
    userid: string | null;
}

export interface CompanySpecialLicenseConfig {
    specialLicenseId: number;
    specialLicenseName: string;
    companyUniqueId: string;
    isActive: boolean;
    hasExpiry: boolean;
    isEmployeeApplicable: boolean;
    firstNotificationDate: number;
    secondNotificationDate: number;
    documentFile: string;
    userid: string;
}

export interface CompanyQualificationListItem {
    qualificationId: number;
    qualificationName: string;
    companyUniqueId: string;
    createdBy: string | null;
    createdDate: string | null;
    modifiedBy: string | null;
    modifiedDate: string;
    isActive: boolean;
    qualificationType: string;
}

export interface CompanyQualificationConfig {
    qualificationId: number;
    qualificationName: string;
    companyUniqueId: string;
    isActive: boolean;
    qualificationType: string;
    hasExpiry: boolean;
    isEmployeeApplicable: boolean;
    firstNotificationDate: number | null;
    secondNotificationDate: number | null;
}

export interface Job {
    applicants: number;
    companyId: string;
    createdByUserId: string | null;
    createdDate: string;
    departmentId: number;
    isActive: boolean;
    jobDescription: string;
    jobTitle: string;
    jobType: string;
    jobsId: number;
    locationId: number;
    locationName: string;
    payRateString: string | null;
    payType: string | null;
    positionId: number;
    requirements: string;
    salary: number;
    shortDesc: string;
    updatedByUserId: string | null;
    updatedDate: string | null;
}

export interface CompanyDepartmentListItem {
    departmentId: number;
    departmentName: string;
    companyUniqueId: string;
    createdBy: string | null;
    createdDate: string | null;
    modifiedBy: string | null;
    modifiedDate: string;
    isActive: boolean;
    parentDepartmentId: number;
    excelDepartmentId: number;
    id: string;
    text: string;
    parent: string;
    children: CompanyDepartmentListItem[] | null;
    isManager: boolean | null;
    postionId: number | null;
}

export interface JobApplicationModel {
    jobApplicantId: number;
    jobId: number | null;
    jobTitle: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
    isLegalRights: boolean | null;
    isConvicted: boolean | null;
    convictedComment: string | null;
    isAgeTwentyOne: boolean | null;
    isAgeNinteen: boolean | null;
    shiftCanNotWork: string | null;
    isOvertime: boolean | null;
    isAvailableWholeSeason: boolean | null;
    noAvailableDays: string | null;
    soonestDateAVailable: Date | null;
    isNeedHousing: boolean | null;
    gpaDegree: string | null;
    isMilatary: boolean | null;
    milataryDuty: string | null;
    resumeFilePath: string | null;
    createdDate: Date | null;
    createdDateSt: string | null;
    dob: Date | null;
    socialSecurityNo: string | null;
    positionAppliedFor: string | null;
    secondChoice: string | null;
    positionDateAvailable: Date | null;
    employmentType_FullTimeYearRound: boolean | null;
    employmentType_FullTimeSeasonal: boolean | null;
    employmentType_PartTime: boolean | null;
    employmentType_Internship: boolean | null;
    areYouEmployedNow: boolean | null;
    isSeasonalEmployees: boolean | null;
    seasonalEmployees: string | null;
    workExperience1_DateEmployeement: Date | null;
    workExperience1_To_DateEmployeement: Date | null;
    workExperience1_CompanyName: string | null;
    workExperience1_City: string | null;
    workExperience1_State: string | null;
    workExperience1_Position: string | null;
    workExperience1_Reason: string | null;
    workExperience1_JobDescription: string | null;
    workExperience2_DateEmployeement: Date | null;
    workExperience2_To_DateEmployeement: Date | null;
    workExperience2_CompanyName: string | null;
    workExperience2_City: string | null;
    workExperience2_State: string | null;
    workExperience2_Position: string | null;
    workExperience2_Reason: string | null;
    workExperience2_JobDescription: string | null;
    workExperience3_DateEmployeement: Date | null;
    workExperience3_To_DateEmployeement: Date | null;
    workExperience3_CompanyName: string | null;
    workExperience3_City: string | null;
    workExperience3_State: string | null;
    workExperience3_Position: string | null;
    workExperience3_Reason: string | null;
    workExperience3_JobDescription: string | null;
    isLegallyEligibleUS: boolean | null;
    isConvictedFelony: boolean | null;
    convictedFelony: string | null;
    educationalHistory1_Year: string | null;
    educationalHistory1_College: string | null;
    educationalHistory1_Diploma_Degree: string | null;
    educationalHistory2_Year: string | null;
    educationalHistory2_College: string | null;
    educationalHistory2_Diploma_Degree: string | null;
    educationalHistory3_Year: string | null;
    educationalHistory3_College: string | null;
    educationalHistory3_Diploma_Degree: string | null;
    educationalHistory4_Year: string | null;
    educationalHistory4_College: string | null;
    educationalHistory4_Diploma_Degree: string | null;
    references1_FullName: string | null;
    references1_Company_Position: string | null;
    references1_YearKnown: string | null;
    references1_Contact: string | null;
    references2_FullName: string | null;
    references2_Company_Position: string | null;
    references2_YearKnown: string | null;
    references2_Contact: string | null;
    references3_FullName: string | null;
    references3_Company_Position: string | null;
    references3_YearKnown: string | null;
    references3_Contact: string | null;
    references4_FullName: string | null;
    references4_Company_Position: string | null;
    references4_YearKnown: string | null;
    references4_Contact: string | null;
    specialSkills_DesiredPosition: string | null;
    specialSkills_DesiredPositionOther: string | null;
    specialSkills_Licenses_CPRCertification: boolean | null;
    specialSkills_Licenses_FirstAidCertificate: boolean | null;
    specialSkills_Licenses_ValidDriversLicense: boolean | null;
    specialSkills_Licenses_CDLandPhysicalDOTExam: boolean | null;
    specialSkills_Licenses_USCGCaptainsLicense: boolean | null;
    specialSkills_Licenses_CPRCertification_ExpDate: Date | null;
    specialSkills_Licenses_FirstAidCertificate_ExpDate: Date | null;
    specialSkills_Licenses_ValidDriversLicense_ExpDate: Date | null;
    specialSkills_Licenses_CDLandPhysicalDOTExam_ExpDate: Date | null;
    specialSkills_Licenses_USCGCaptainsLicense_ExpDate: Date | null;
    licensedDriver: string | null;
    drivingViolations_TwoYears: string | null;
    timeSpentAlaska: string | null;
    whyWorkAlaskaX: string | null;
    location_PreferToWork_Juneau: boolean | null;
    location_PreferToWork_GlacierPoint: boolean | null;
    location_PreferToWork_Skagway: boolean | null;
    location_PreferToWork_NoPreference: boolean | null;
    hearWorkOpportunity_Colorworks: boolean | null;
    hearWorkOpportunity_Ourwebsite: boolean | null;
    hearWorkOpportunity_Indeed: boolean | null;
    hearWorkOpportunity_Wanderjobs: boolean | null;
    hearWorkOpportunity_Facebook: boolean | null;
    hearWorkOpportunity_Other: boolean | null;
    allPositions_ByInitialingHere: boolean | null;
    isTallerThan: boolean | null;
    tallerThan_Height_Ft: string | null;
    tallerThan_Height_In: string | null;
    isWeigh200lbs: boolean | null;
    weight_Lbs: string | null;
    additionalinformationShare: string | null;
    applicatSignature: string | null;
    applicatDate: Date | null;
}

export interface CompanyOrgChart {
    departmentId: number;
    departmentName: string;
    totalStaffNeeded: number;
    departmentStaffHired: number;
    staffHired: number;
    parentDepartmentId: number;
    childPositionCount: number;
    listManagerPosition: PositionList[];
    listStaffPosition: PositionList[];
    listChildPositions: CompanyOrgChart[];
}

export interface PositionList {
    positionId: number;
    positionName: string;
    staffCount: number;
    hiredStaffCount: number;
}

export interface OrgChartUser {
    firstName: string;
    lastName: string;
    id: string;
    email: string;
    companyUniqueId: string;
    departmentId: number;
    positionId: number;
    positionName: string;
    departmentName: string;
    isManager: boolean;
}
