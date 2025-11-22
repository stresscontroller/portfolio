import { AspNetUserModel } from '../aspnet-user.model';
import { Department } from './api-departments.model';
import { DepartmentPosition } from './api-departments.model';

export interface UserDetails {
    profilePicturePath: string;
    profilePictureUploadedFileName: string;
    userId: string;
    firstName: string;
    lastName: string;
    nickName: string;
    roleName: string;
    email: string;
    secondaryEmail: string;
    roleId: string;
    phoneNumber: string;
    address: string;
    address2: string;
    city: string;
    stateId: number;
    countryId: number;
    zipcode: string;
    isEmployee: boolean;
    partnerId: number | null;
}

export interface UserDetailsConfig {
    userId: string;
    firstName: string;
    lastName: string;
    nickName: string;
    email: string;
    secondaryEmail: string;
    roleName: string;
    roleId: string;
    phoneNumber: string;
    address: string;
    address2: string;
    city: string;
    stateId: number;
    countryId: number;
    zipcode: string;
    isEmployee: boolean;
}

export interface UserRoles {
    id: string;
    name: string;
    isActive: boolean | null;
    isGlobal: boolean | null;
    isEditable: boolean | null;
    roleIndex: number | null;
    companyUniqueId: string | null;
}

export interface UserListItemWithDepartmentsPositions {
    aspNetUserModel: AspNetUserModel;
    departments: Department[];
    positions: DepartmentPosition[];
}

export interface CommunicationsConfig {
    subject: string;
    message: string;
    from: string;
    isBodyHtml: boolean;
    to: string[];
}
