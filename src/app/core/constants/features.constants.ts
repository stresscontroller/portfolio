//  Record<
// string,
// {
//     name: string;
//     route: string;
//     pages: Record<string, { name: string; route: string; pageFeatures?: string }>;
// }
// >
export const Features = {
    dailyTourDispatch: {
        name: 'Operator_DailyTourDispatch',
        route: 'tour-dispatch',
        pages: {
            dailyTourDispatch: {
                name: 'DailyTourDispatch',
                route: '/',
                features: {
                    confirmGuests: {
                        name: 'ConfirmGuests',
                    },
                    statusUpdate: {
                        name: 'StatusUpdate',
                    },
                    transportationUpdate: {
                        name: 'TransportationUpdate',
                    },
                    sharePDF: {
                        name: 'SharePDF',
                    },
                    finalUpdate: {
                        name: 'FinalUpdate',
                    },
                    dockDriverUpdate: {
                        name: 'DockOrDriverUpdate',
                    },
                    preLimUpdate: {
                        name: 'PreLimUpdate',
                    },
                    addOtcBooking: {
                        name: 'AddOtcBooking',
                    },
                    notesView: {
                        name: 'NotesView',
                    },
                    notesUpdate: {
                        name: 'NotesUpdate',
                    },
                    bookingUpdate: {
                        name: 'BookingUpdate',
                    },
                    bookingView: {
                        name: 'BookingView',
                    },
                    bookingNotesView: {
                        name: 'BookingNotesView',
                    },
                    bookingTimeUpdate: {
                        name: 'BookingTimeUpdate',
                    },
                    bookingDelete: {
                        name: 'BookingDelete',
                    },
                    departureTimeUpdate: {
                        name: 'DepartureTimeUpdate',
                    },
                    qrcodeCheckin: {
                        name: 'QrcodeCheckin',
                    },
                    otcAllowOverbook: {
                        name: 'OtcAllowOverbook',
                    },
                    updateBookingAllowOverbook: {
                        name: 'UpdateBookingAllowOverbook',
                    },
                    addJointDeparture: {
                        name: 'AddJointDeparture',
                    },
                },
            },
        },
    },
    inventoryManagement: {
        name: 'Operator_InventoryManagement',
        route: 'inventory-management',
        pages: {
            manageAllocation: {
                name: 'ManageAllocation',
                route: 'manage-allocation',
                features: {
                    addUnallocatedInventory: {
                        name: 'AddUnallocatedInventory',
                    },
                    allocateInventory: {
                        name: 'AllocateInventory',
                    },
                    releaseInventory: {
                        name: 'ReleaseInventory',
                    },
                    editInventory: {
                        name: 'EditInventory',
                    },
                    deleteInventory: {
                        name: 'DeleteInventory',
                    },
                },
            },
            needingAllocation: {
                name: 'NeedingAllocation',
                route: 'needing-allocation',
                features: {
                    editInventory: {
                        name: 'EditInventory',
                    },
                    setReminder: {
                        name: 'SetReminder',
                    },
                    ignoreReminder: {
                        name: 'IgnoreReminder',
                    },
                },
            },
            recentlyReleasedInventories: {
                name: 'RecentlyReleasedInventories',
                route: 'recently-released-inventories',
                features: {
                    dismissNotification: {
                        name: 'DismissNotification',
                    },
                    sendNotification: {
                        name: 'SendNotification',
                    },
                },
            },
            salesAndReports: {
                name: 'SalesReportMapping',
                route: 'sales-and-report',
                features: {
                    uploadFiles: {
                        name: 'UploadFiles',
                    },
                    tourMappingDelete: {
                        name: 'TourMappingDelete',
                    },
                    tourMappingUpdate: {
                        name: 'TourMappingUpdate',
                    },
                    tourMappingCreate: {
                        name: 'TourMappingCreate',
                    },
                    shipMappingDelete: {
                        name: 'ShipMappingDelete',
                    },
                    shipMappingUpdate: {
                        name: 'ShipMappingUpdate',
                    },
                    shipMappingCreate: {
                        name: 'ShipMappingCreate',
                    },
                    portMappingDelete: {
                        name: 'PortMappingDelete',
                    },
                    portMappingUpdate: {
                        name: 'PortMappingUpdate',
                    },
                    portMappingCreate: {
                        name: 'PortMappingCreate',
                    },
                    fileHeaderMappingDelete: {
                        name: 'FileHeaderMappingDelete',
                    },
                    fileHeaderMappingUpdate: {
                        name: 'FileHeaderMappingUpdate',
                    },
                    fileHeaderMappingCreate: {
                        name: 'FileHeaderMappingCreate',
                    },
                },
            },
        },
    },
    cruiseCalendar: {
        name: 'Operator_CruiseCalendar',
        route: 'cruise-calendar',
        pages: {
            cruiseCalendar: {
                name: 'CruiseCalendar',
                route: '/',
                features: {
                    assignDock: {
                        name: 'AssignDock',
                    },
                },
            },
        },
    },
    userManagement: {
        name: 'Operator_UserManagement',
        route: 'user-management/dashboard',
        pages: {
            userList: {
                name: 'UserList',
                route: 'users',
                features: {
                    userCreate: {
                        name: 'UserCreate',
                    },
                    userDelete: {
                        name: 'UserDelete',
                    },
                    userRestore: {
                        name: 'UserRestore',
                    },
                },
            },
            userRoles: {
                name: 'UserRoles',
                route: 'roles',
                features: {
                    roleCreate: {
                        name: 'RoleCreate',
                    },
                    roleDelete: {
                        name: 'RoleDelete',
                    },
                    roleUpdate: {
                        name: 'RoleUpdate',
                    },
                    rolePermissionUpdate: {
                        name: 'RolePermissionUpdate',
                    },
                },
            },
        },
    },
    userManagementEdit: {
        name: 'Operator_UserManagementEdit',
        route: 'user-management/users',
        pages: {
            userInformation: {
                name: 'UserInformation',
                route: 'user-information',
                features: {
                    photoUpdate: {
                        name: 'PhotoUpdate',
                    },
                    informationUpdate: {
                        name: 'InformationUpdate',
                    },
                    roleUpdate: {
                        name: 'RoleUpdate',
                    },
                    agentUpdate: {
                        name: 'AgentUpdate',
                    },
                },
            },
            payroll: {
                name: 'Payroll',
                route: 'payroll',
                features: {
                    informationUpdate: {
                        name: 'InformationUpdate',
                    },
                    informationDelete: {
                        name: 'InformationDelete',
                    },
                    positionCreate: {
                        name: 'PositionCreate',
                    },
                    eligibleForHireView: {
                        name: 'EligibleForHireView',
                    },
                    eligibleForHireUpdate: {
                        name: 'EligibleForHireUpdate',
                    },
                    isHiredView: {
                        name: 'IsHiredView',
                    },
                    isHiredUpdate: {
                        name: 'IsHiredUpdate',
                    },
                },
            },
            certifications: {
                name: 'Certifications',
                route: 'certifications',
                features: {
                    certificationCreate: {
                        name: 'CertificationCreate',
                    },
                    certificationUpdate: {
                        name: 'CertificationUpdate',
                    },
                    certificationDelete: {
                        name: 'CertificationDelete',
                    },
                },
            },
            specialLicenses: {
                name: 'SpecialLicenses',
                route: 'licenses',
                features: {
                    licenseCreate: {
                        name: 'LicenseCreate',
                    },
                    licenseUpdate: {
                        name: 'LicenseUpdate',
                    },
                    licenseDelete: {
                        name: 'LicenseDelete',
                    },
                },
            },
            training: {
                name: 'Training',
                route: 'training',
                features: {
                    trainingCreate: {
                        name: 'TrainingCreate',
                    },
                    trainingUpdate: {
                        name: 'TrainingUpdate',
                    },
                    trainingDelete: {
                        name: 'TrainingDelete',
                    },
                },
            },
            housing: {
                name: 'Housing',
                route: 'housing',
                features: {
                    housingUpdate: {
                        name: 'HousingUpdate',
                    },
                },
            },
            evaluations: {
                name: 'Evaluations',
                route: 'evaluations',
                features: {
                    evaluationsCreate: {
                        name: 'EvaluationsCreate',
                    },
                    evaluationsUpdate: {
                        name: 'EvaluationsUpdate',
                    },
                    evaluationsDelete: {
                        name: 'EvaluationsDelete',
                    },
                },
            },
            notes: {
                name: 'Notes',
                route: 'notes',
                features: {
                    notesCreate: {
                        name: 'NotesCreate',
                    },
                    notesUpdate: {
                        name: 'NotesUpdate',
                    },
                    notesDelete: {
                        name: 'NotesDelete',
                    },
                },
            },
        },
    },
    bookingManagement: {
        name: 'Operator_BookingManagement',
        route: 'booking-management',
        pages: {
            agents: {
                name: 'Agents',
                route: 'agents',
                features: {
                    agentCreate: {
                        name: 'AgentCreate',
                    },
                    agentUpdate: {
                        name: 'AgentUpdate',
                    },
                    agentDelete: {
                        name: 'AgentDelete',
                    },
                },
            },
            bookings: {
                name: 'Bookings',
                route: 'bookings',
                features: {
                    bookingCreate: {
                        name: 'BookingCreate',
                    },
                    bookingEdit: {
                        name: 'BookingEdit',
                    },
                    exportToExcel: {
                        name: 'ExportToExcel',
                    },
                },
            },
            bookingEdit: {
                name: 'BookingEdit',
                route: 'bookings/:id',
                features: {
                    bookingDelete: {
                        name: 'BookingDelete',
                    },
                    bookingUpdate: {
                        name: 'BookingUpdate',
                    },
                },
            },
            cruiseLines: {
                name: 'CruiseLines',
                route: 'cruise-lines',
            },
            cruiseShips: {
                name: 'CruiseShips',
                route: 'cruise-ships',
            },
            dashboard: {
                name: 'Dashboard',
                route: 'dashboard',
            },
            tourInventory: {
                name: 'TourInventory',
                route: 'tour-inventory',
                features: {
                    tourInventoryEdit: {
                        name: 'TourInventoryEdit',
                    },
                    tourInventoryDelete: {
                        name: 'TourInventoryDelete',
                    },
                    tourInventoryViewBookings: {
                        name: 'TourInventoryViewBookings',
                    },
                },
            },
            payments: {
                name: 'Payments',
                route: 'payments',
                features: {
                    paymentCreate: {
                        name: 'PaymentCreate',
                    },
                },
            },
        },
    },
    bookingManagementAgentEdit: {
        name: 'Operator_BookingManagementAgentEdit',
        route: 'booking-management/agent',
        pages: {
            account: {
                name: 'Account',
                route: 'account',
                features: {
                    accountUpdate: {
                        name: 'AccountUpdate',
                    },
                    emailUpdate: {
                        name: 'EmailUpdate',
                    },
                },
            },
            agreements: {
                name: 'Agreements',
                route: 'agreements',
            },
            bookings: {
                name: 'Bookings',
                route: 'bookings',
                features: {
                    bookingCreate: {
                        name: 'BookingCreate',
                    },
                    bookingEdit: {
                        name: 'BookingEdit',
                    },
                    exportToExcel: {
                        name: 'ExportToExcel',
                    },
                },
            },
            bookingEdit: {
                name: 'BookingEdit',
                route: 'bookings/:id',
                features: {
                    bookingDelete: {
                        name: 'BookingDelete',
                    },
                    bookingUpdate: {
                        name: 'BookingUpdate',
                    },
                },
            },
            payments: {
                name: 'Payments',
                route: 'payments',
                features: {
                    paymentCreate: {
                        name: 'PaymentCreate',
                    },
                },
            },
            statements: {
                name: 'Statements',
                route: 'statements',
                features: {
                    viewStatement: {
                        name: 'ViewStatement',
                    },
                    reconcileInvoices: {
                        name: 'ReconcileInvoices',
                    },
                },
            },
            statementDetails: {
                name: 'StatementDetails',
                route: 'statements/details',
                features: {
                    exportToExcel: {
                        name: 'ExportToExcel',
                    },
                    addPayment: {
                        name: 'AddPayment',
                    },
                },
            },
        },
    },
    profile: {
        name: 'Operator_Profile',
        route: 'profile',
        pages: {
            userInformation: {
                name: 'UserInformation',
                route: 'user-information',
                features: {
                    photoUpdate: {
                        name: 'PhotoUpdate',
                    },
                    informationUpdate: {
                        name: 'InformationUpdate',
                    },
                    roleUpdate: {
                        name: 'RoleUpdate',
                    },
                    agentUpdate: {
                        name: 'AgentUpdate',
                    },
                },
            },
            payroll: {
                name: 'Payroll',
                route: 'payroll',
                features: {
                    informationUpdate: {
                        name: 'InformationUpdate',
                    },
                    informationDelete: {
                        name: 'InformationDelete',
                    },
                    positionCreate: {
                        name: 'PositionCreate',
                    },
                    eligibleForHireView: {
                        name: 'EligibleForHireView',
                    },
                    eligibleForHireUpdate: {
                        name: 'EligibleForHireUpdate',
                    },
                    isHiredView: {
                        name: 'IsHiredView',
                    },
                    isHiredUpdate: {
                        name: 'IsHiredUpdate',
                    },
                },
            },
            certifications: {
                name: 'Certifications',
                route: 'certifications',
                features: {
                    certificationCreate: {
                        name: 'CertificationCreate',
                    },
                    certificationUpdate: {
                        name: 'CertificationUpdate',
                    },
                    certificationDelete: {
                        name: 'CertificationDelete',
                    },
                },
            },
            specialLicenses: {
                name: 'SpecialLicenses',
                route: 'licenses',
                features: {
                    licenseCreate: {
                        name: 'LicenseCreate',
                    },
                    licenseUpdate: {
                        name: 'LicenseUpdate',
                    },
                    licenseDelete: {
                        name: 'LicenseDelete',
                    },
                },
            },
            training: {
                name: 'Training',
                route: 'training',
                features: {
                    trainingCreate: {
                        name: 'TrainingCreate',
                    },
                    trainingUpdate: {
                        name: 'TrainingUpdate',
                    },
                    trainingDelete: {
                        name: 'TrainingDelete',
                    },
                },
            },
            housing: {
                name: 'Housing',
                route: 'housing',
                features: {
                    housingUpdate: {
                        name: 'HousingUpdate',
                    },
                },
            },
            evaluations: {
                name: 'Evaluations',
                route: 'evaluations',
                features: {
                    evaluationsCreate: {
                        name: 'EvaluationsCreate',
                    },
                    evaluationsUpdate: {
                        name: 'EvaluationsUpdate',
                    },
                    evaluationsDelete: {
                        name: 'EvaluationsDelete',
                    },
                },
            },
            notes: {
                name: 'Notes',
                route: 'notes',
                features: {
                    notesCreate: {
                        name: 'NotesCreate',
                    },
                    notesUpdate: {
                        name: 'NotesUpdate',
                    },
                    notesDelete: {
                        name: 'NotesDelete',
                    },
                },
            },
        },
    },
    download: {
        name: 'Operator_Download',
        route: 'mobile-app',
        pages: {
            install: {
                name: 'Install',
                route: 'mobile-app',
                features: {
                    installApplication: {
                        name: 'InstallApplication',
                    },
                },
            },
        },
    },
    toursAndServices: {
        name: 'Operator_ToursAndServices',
        route: 'tours-and-services',
        pages: {
            tourList: {
                name: 'TourList',
                route: 'tours-list',
            },
            faq: {
                name: 'Faq',
                route: 'faq',
            },
            dock: {
                name: 'Dock',
                route: 'dock',
            },
            pickupLocation: {
                name: 'PickupLocation',
                route: 'pickup-location',
            },
            discountCode: {
                name: 'DiscountCode',
                route: 'discount-code',
            },
        },
    },
    toursAndServicesEdit: {
        name: 'Operator_ToursAndServicesEdit',
        route: 'tours-and-services',
        pages: {
            details: {
                name: 'Details',
                route: 'details',
                features: {
                    editTourDetails: {
                        name: 'EditTourDetails',
                    },
                },
            },
            refundPolicy: {
                name: 'RefundPolicy',
                route: 'refund-policy',
                features: {
                    editRefundPolicy: {
                        name: 'EditRefundPolicy',
                    },
                },
            },
            itinerary: {
                name: 'Itinerary',
                route: 'itinerary',
                features: {
                    addItinerary: {
                        name: 'AddItinerary',
                    },
                    editItinerary: {
                        name: 'EditItinerary',
                    },
                    deleteItinerary: {
                        name: 'DeleteItinerary',
                    },
                    reorderItinerary: {
                        name: 'ReorderItinerary',
                    },
                },
            },
            included: {
                name: 'Included',
                route: 'included',
                features: {
                    addItem: {
                        name: 'AddItem',
                    },
                    editItem: {
                        name: 'EditItem',
                    },
                    deleteItem: {
                        name: 'DeleteItem',
                    },
                },
            },
            price: {
                name: 'Price',
                route: 'price',
                features: {
                    addPrice: {
                        name: 'AddPrice',
                    },
                    editPrice: {
                        name: 'EditPrice',
                    },
                    deletePrice: {
                        name: 'DeletePrice',
                    },
                },
            },
            gallery: {
                name: 'Gallery',
                route: 'gallery',
                features: {
                    uploadImage: {
                        name: 'UploadImage',
                    },
                    deleteImage: {
                        name: 'DeleteImage',
                    },
                },
            },
            video: {
                name: 'Video',
                route: 'video',
                features: {
                    uploadVideo: {
                        name: 'UploadVideo',
                    },
                    deleteVideo: {
                        name: 'DeleteVideo',
                    },
                },
            },
        },
    },
    fleetManagement: {
        name: 'Operator_FleetManagement',
        route: 'fleet-management/dashboard',
        pages: {
            stats: {
                name: 'Stats',
                route: 'stats',
            },
            equipments: {
                name: 'Equipments',
                route: 'equipments',
            },
            equipmentTypes: {
                name: 'EquipmentTypes',
                route: 'equipmentTypes',
            },
            forms: {
                name: 'Forms',
                route: 'forms',
            },
        },
    },
    fleetManagementEquipment: {
        name: 'Operator_FleetManagementEquipment',
        route: 'fleet-management/equipment',
        pages: {
            equipmentInfo: {
                name: 'EquipmentInfo',
                route: 'info',
            },
            usage: {
                name: 'Usage',
                route: 'usage',
            },
            maintenance: {
                name: 'Maintenance',
                route: 'maintenance',
            },
        },
    },
    companySettings: {
        name: 'Operator_CompanySettings',
        route: 'company-settings',
        pages: {
            companyInfo: {
                name: 'Company Info',
                route: 'company-info',
            },
            departments: {
                name: 'Departments',
                route: 'departments',
            },
            dashboard: {
                name: 'Dashboard',
                route: 'dashboard',
            },
            jobs: {
                name: 'Jobs',
                route: 'jobs',
                features: {
                    applicantsView: {
                        name: 'ApplicantsView',
                    },
                    jobEdit: {
                        name: 'JobEdit',
                    },
                    jobView: {
                        name: 'JobView',
                    },
                },
            },
        },
    },
};
