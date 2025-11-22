export interface UserEvaluationsListItem {
    userEvaluationCoachingId: number;
    type: string;
    formPath: string;
    formDate: string;
    isActive: boolean;
    userId: string;
    companyUniqueId: string;
    createdDate: string;
    modifiedDate: string;
    formFile: string;
}

export interface UserEvaluationsConfig {
    userEvaluationCoachingId: number;
    formFile?: File;
    formPath: string;
    isActive: boolean;
    fromDate: string;
    type: string;
    userId: string;
    companyId: string;
}
