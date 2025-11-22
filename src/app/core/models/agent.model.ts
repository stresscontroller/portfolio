export interface PartnerId {
    partnerId: number;
}

export interface AgentCompanyDashboardGeneralSummary {
    averageSales: number;
    bookings: number;
    guests: number;
    sales: number;
}

export interface AgentCompanyDashboardTourSalesByProduct {
    averageSales: number;
    bookingCount: number;
    bookingWindow: number;
    totalCustomer: number;
    totalSalesDollar: number;
    tourName: string;
}

export interface AgentCompanyDashboardBookingStats {
    avgBookingWindow: string;
    bestGrossingTourName: string;
    bestGrossingTourTotal: number;
    bestSellingCruiseLine: string;
    bestSellingCruiseLineTotal: number;
    bestSellingCruiseShip: string;
    bestSellingCruiseShipTotal: number;
    mostPassengersBookedTotal: number;
    mostPassengersBookedTourName: string;
    secondBestSellingCruiseLine: string;
    secondBestSellingCruiseLineTotal: number;
    secondBestSellingCruiseShip: string;
    secondBestSellingCruiseShipTotal: number;
    thirdBestSellingCruiseLine: string;
    thirdBestSellingCruiseLineTotal: number;
    thirdBestSellingCruiseShip: string;
    thirdBestSellingCruiseShipTotal: number;
}

export interface AgentCompanyDashboardSalesByDay {
    bookingAmount: number;
    bookingCount: number;
    bookingPassengerCount: number;
    dayName: string;
    dayNumber: number;
}

export interface AgentCompanyDashboardSalesByMonth {
    bookingAmount: number;
    bookingCount: number;
    bookingPassengerCount: number;
    monthName: string;
    monthNumber: number;
    reportYear: number;
}

export interface Agent {
    partnerId: number;
    partnerName: string;
    uniqueName: string;
    contactPersonFirstName: string;
    contactPersonLastName: string;
    phoneNumber: string;
    companyUniqueId: string;
    email: string;
    address1: string;
    address2: string;
    city: string;
    stateId: number;
    countryId: number;
    zipCode: string;
    notes: string;
    isActive: boolean | null;
    type: number;
    commission: number;
    allowInvoice: boolean | null;
    allowOtc: boolean | null;
    website: string;
    isParentCompany: boolean | null;
    isCruiseLine: boolean | null;
    shipCompanyId: number;
    isTaxable: boolean | null;
}

export interface AgentUser {
    partnerId: number;
    partnerName: string;
    uniqueName: string;
    contactPersonFirstName: string;
    contactPersonLastName: string;
    phoneNumber: string;
    companyUniqueId: string;
    email: string;
    address1: string;
    address2: string | null;
    city: string;
    stateId: number;
    countryId: number;
    zipCode: string;
    notes: string | null;
    isActive: boolean;
    type: number;
    commission: number;
    allowInvoice: boolean;
    website: string | null;
    isParentCompany: boolean;
    isCruiseLine: boolean;
    shipCompanyId: number | null;
    allowOtc: boolean | null;
}

export interface UserAgentMapping {
    id: number | null;
    userId: number | null;
    agentId: number | null;
}

export interface AgentStatement {
    month: string;
    totalSalesAmount: number;
    totalEarnedComission: number;
    monthIndex: number;
    agentId: number;
    startDate: Date;
    endDate: Date;
    netAmount: number;
    salesTax: number;
    fee: number;
}

export interface AgentStatementList {
    month: string;
    totalSalesAmount: number;
    totalEarnedComission: number;
    monthIndex: number;
    agentId: number;
    startDate: Date;
    endDate: Date;
    netAmount: number;
    salesTax: number;
    fee: number;
}

export interface AgentBookingStatement {
    bookingId: number;
    tourInventoryId: number;
    bookingNumber: string;
    bookingDateString: string;
    bookingTimeString: string;
    purchaseDateString: string;
    adults: number | null;
    children: number | null;
    infants: number | null;
    isActive: boolean | null;
    tourName: string;
    firstName: string;
    lastName: string;
    cruiseLineName: string;
    shipName: string;
    pickUp: string;
    phoneNumber: string;
    paymentType: string;
    remainingAmountAfterRefund: string;
    isFullyRefundable: boolean;
    totalSalesAmount: number;
    totalEarnedCommission: number;
    reservationBookingId: string;
    fee: number;
    netAmount: number;
    totalOpenBalance: number;
    salesTax: number;
    salesTaxOnNet: number;
    feeOnNet: number;
}

export interface InvoicesModel {
    id: number;
    month: string;
    year: number;
    sales?: number;
    credit?: number;
    debit?: number;
    commission?: number;
    tax?: number;
}

export interface AgentInvoice {
    agentInvoiceId: number | null;
    companyId: string;
    agentId: number;
    startDate: Date | null;
    endDate: Date | null;
    startBookingId: number | null;
    endBookingId: number | null;
    isProcessed: boolean | null;
    processedBy: string | null;
    createdDate: Date | null;
    amount: number | null;
    notes: string;
    isCredit: boolean | null;
    isActive: boolean | null;
}

export interface SettleAgentInvoiceParams {
    agentId: number;
}

export interface AgentInvoicePayment {
    agentInvoicePaymentId: number | null;
    agentInvoiceId: number;
    companyId: string;
    agentId: number;
    paymentMode: string | null;
    paymentType: string;
    amount: number | null;
    chequeNumber: string | null;
    authorizeCode: string | null;
    paymentStatus: number | null;
    createdDate: Date | null;
    paymentDate: Date | null;
    notes: string;
    isActive: boolean | null;
    //Additional property
    agentName?: string | null;
}

export interface AgentInvoicePaymentType {
    name: string;
    paymentType: string;
}

export const paymentTypes: AgentInvoicePaymentType[] = [
    { name: 'Cash', paymentType: 'Cash' },
    { name: 'Check', paymentType: 'Cheque' },
    { name: 'Credit Card', paymentType: 'CreditCard' },
    { name: 'eCheck', paymentType: 'eCheck' },
    { name: 'WTF', paymentType: 'WTF' },
];
