export interface B2CUser {
    id: null | string;
    companyUniqueID: null | string;
    email: string;
    emailConfirmed: boolean;
    passwordHash: null | string;
    securityStamp: null | string;
    phoneNumber: null | string;
    phoneNumberConfirmed: boolean;
    twoFactorEnabled: boolean;
    lockoutEndDateUtc: null | string;
    lockoutEnabled: boolean;
    accessFailedCount: number;
    userName: null | string;
    password: null | string;
    isActive: null | boolean;
    roleId: null | string;
    firstName: string;
    lastName: string;
    createdBy: null | string;
    createdDate: null | string;
    modifiedBy: null | string;
    modifiedDate: null | string;
    address: null | string;
    isEmailDeleted: null | string;
    address2: null | string;
    city: null | string;
    stateId: null | string;
    countryId: null | string;
    zipcode: null | string;
    nickName: null | string;
    isAllowuserInvoice: null | boolean;
    allowInvoice: null | boolean;
    userWebsite: null | string;
    profilePicture: null | string;
    profilePicturePath: null | string;
    profilePictureUploadedFileName: null | string;
    isEmployee: null | string;
    isCMSuser: null | string;
    navigateToken: null | string;
    b2CUserId: null | string;
}

export interface ApiCreateB2CUserRequest {
    id: string; // should be left as an empty string (will be populated on the backend)
    userName: string; // should be left as an empty string
    email: string;
    secondaryEmail: string;
    password: string;
    firstName: string;
    lastName: string;
    stateName: string;
    countryName: string;
    isActive?: boolean;
    phoneNumber?: string;
    companyUniqueId?: string; // Can add this in if you want to create a user under a specific company
}
