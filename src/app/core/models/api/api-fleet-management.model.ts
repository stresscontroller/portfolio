export interface EquipmentTypeFieldListItem {
    equipmentTypeFieldId: number;
    equipmentTypeFieldName: string;
    isActive?: boolean;
}

export interface EquipmentTypeListItem {
    equipmentTypeID: number;
    equipmentName: string;
    equipmentDescription: string;
    engineOilChangeevery: number;
    differentialOilChangeevery: number;
    transmissionOilChangeevery: number;
    hydraulicOilChangeevery: number;
    batteryChangeCheckevery: number;
    coolantFlushChangeevery: number;
    dailyMaxUsageLimit: number;
}

export interface EquipmentTypeDetailItem {
    equipmentTypeID: number;
    equipmentName: string;
    equipmentDescription: string;
    engineOilChangeevery: number;
    differentialOilChangeevery: number;
    transmissionOilChangeevery: number;
    hydraulicOilChangeevery: number;
    batteryChangeCheckevery: number;
    coolantFlushChangeevery: number;
    dailyMaxUsageLimit: number;
    equipmentTypeFieldList: EquipmentTypeFieldDetail[];
}

export interface EquipmentTypeFieldDetail {
    equipmentTypeFieldCheckedId: number;
    equipmentTypeFieldId: string;
    equipmentTypeFieldName: string;
    isActive: boolean;
}

export interface EquipmentTypeConfig {
    equipmentTypeID: number;
    equipmentName: string;
    equipmentDescription: string;
    engineOilChangeevery: number;
    differentialOilChangeevery: number;
    transmissionOilChangeevery: number;
    hydraulicOilChangeevery: number;
    batteryChangeCheckevery: number;
    coolantFlushChangeevery: number;
    dailyMaxUsageLimit: number;
    companyId: string;
    equipmentTypeFieldList: EquipmentTypeFieldConfig[];
}

export interface EquipmentTypeFieldConfig {
    equipmentTypeFieldId: string;
    isActive: boolean;
}

export interface EquipmentListItem {
    equipmentID: number;
    equipmentNumber: string;
    equipmentDescription: string;
    isAvailable: boolean;
    equipmentTypeID: number;
    equipmentType: string;
    maxCapacity: number;
    licensePlate: string;
    serialNo: string;
    odometerMileageHours: number;
    isOperable: boolean;
    isActive: boolean;
}

export interface EquipmentConfig {
    equipmentID: number;
    equipmentTypeID: number;
    licensePlate: string;
    equipmentNumber: string;
    serialNo: string;
    equipmentDescription: string;
    viNno: string;
    make: string;
    isOperable: boolean;
    model: string;
    year: number;
    companyId: string;
    differentialGearOil: number;
    hydraulicOilInterval: number;
    batteryChange: string;
    odometerMileageHours: number;
    engineOilInterval: string;
    transmissionOilInterval: string;
    batteryChangeInterval: number;
    locationId: number;
    lastDateOfOperation: string;
    engineOilChange: string;
    hydraulicOilChange: string;
    transmissionOilChange: string;
    differentialGearOilChange: string;
    nextEngineOilChangeAt: number;
    differentialGearOilChangeAt: number;
    transmissionOilChangeAt: number;
    hydraulicOilChangeAt: number;
    batteryChangeAt: string;
    coolantFlushChangeAt: string;
    coolantFlushChange: string;
    coolantFlushChangeInterval: number;
    maxCapacity: number;
    isAvailable: boolean;
}
export interface EquipmentDetail {
    batteryChange: string;
    batteryChangeAt: string;
    batteryChangeInterval: number;
    class: string;
    coolantFlushChange: string;
    coolantFlushChangeAt: string;
    coolantFlushChangeInterval: number;
    differentialGearOilChange: string;
    differentialGearOilChangeAt: number;
    differentialGearoil: number;
    engineOilChange: string;
    engineOilInterval: string;
    equipmentDescription: string;
    equipmentID: number;
    equipmentNumber: string;
    equipmentTypeID: number;
    hydraulicOilChange: string;
    hydraulicOilChangeAt: number;
    hydraulicOilInterval: number;
    isAvailable: boolean;
    isOperable: boolean;
    lastDateOfOperation: string;
    licensePlate: string;
    locationId: number;
    make: string;
    maxCapacity: number;
    model: string;
    nextEngineOilChangeAt: number;
    odometerMileageHours: number;
    serialNo: string;
    transmissionOilChange: string;
    transmissionOilChangeAt: number;
    transmissionOilInterval: string;
    vinNo: string;
    year: number;
}
