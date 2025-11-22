export interface Department {
    departmentId: number;
    departmentName: string;
    companyUniqueId: string;
    createdBy: string | null;
    createdDate: Date;
    modifiedBy: string | null;
    modifiedDate: Date;
    isActive: boolean;
    parentDepartmentId: number;
    excelDepartmentId: number;
    id: string;
    text: string;
    parent: string;
    children: Department[] | null; // Change 'any' to a more specific type if the children have a defined structure
    isManager: boolean | null;
    postionId: number | null;
}

export interface FormattedDepartment extends Department {
    departments: Record<number, FormattedDepartment>;
}

export interface DepartmentPosition {
    positionId: number;
    excelPositionId: number;
    positionName: string;
    companyUniqueId: string;
    createdBy: string | null;
    createdDate: Date;
    modifiedBy: string | null;
    modifiedDate: Date;
    isActive: boolean;
    departmentId: number;
    parentDepartmentId: number | null;
    departmentName: string;
    managerPositionId: number | null;
    excelManagerPositionId: number | null;
    managerPositionName: string | null;
    isManager: boolean;
    isRootLevel: boolean | null;
    numberofStaffNeeded: number | null;
    numberofPositionFilled: number | null;
    index: number;
    children: DepartmentPosition[] | null;
}

export interface PositionDetails {
    positionId: number;
    excelPositionId: number;
    positionName: string;
    companyUniqueId: string;
    createdBy: string | null;
    createdDate: Date;
    modifiedBy: string | null;
    modifiedDate: Date;
    isActive: boolean;
    departmentId: number;
    parentDepartmentId: number | null;
    departmentName: string;
    managerPositionId: number;
    excelManagerPositionId: number | null;
    managerPositionName: string;
    isManager: boolean;
    isRootLevel: boolean;
    numberofStaffNeeded: number;
    numberofPositionFilled: number | null;
    index: number;
    children: PositionDetails[] | null;
}
