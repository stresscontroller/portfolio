export interface Policy {
    policyId: number;
    description: string;
    type: string;
    companyUniqueId: string;
    isActive: string | null;
    createdDate: string | null;
    createdBy: string | null;
    modifiedDate: string | null;
    modifiedBy: string | null;
}
