export interface FormCriteriaItem {
    cruiseCodeFormCriteriaId: number;
    cruiseCodeFormCriteriaName: string;
    cruiseCodeFormCriteriaDescription: string;
    cruiseCodeFormCriteriaToolTip: string;
    cruiseCodeFormCategory: string;
    cruiseCodeFormFieldType: string; // Adjust this based on possible types
    isImageUpload: boolean;
}

export interface FormListItem {
    cruiseCodeFormId: number;
    cruiseCodeFormName: string;
    cruiseCodeFormDescription: string;
}

export interface FormCriteriaDetails {
    cruiseCodeFormId: number;
    cruiseCodeFormName: string;
    cruiseCodeFormDescription: string;
    companyId: string;
    createdBy: string;
    listCruiseCodeFormToCriteria: FormCriteriaStatus[];
}

export interface FormCriteriaStatus {
    cruiseCodeFormCriteriaId: number;
    isCritical: boolean;
    isActive: boolean;
    criteriaSequence: number;
}

export interface FormSubmissionDetails {
    cruiseCodeFormSubmissionId: number;
    cruiseCodeFormId: number;
    cruiseCodeFormSubmissionNote: string;
    createdBy: string;
    listCruiseCodeFormSubmissionAnswer: FormSubmissionAnswer[];
}

export interface FormSubmissionAnswer {
    cruiseCodeFormCriteriaId: number;
    cruiseCodeFormSubmissionAnswer: string;
    answerNotes: string;
}

export interface FormSubmissionListItem {
    cruiseCodeFormSubmissionId: number;
    cruiseCodeFormId: number;
    cruiseCodeFormName: string;
    cruiseCodeFormSubmissionNote: string;
    submissionCreatedDate: string; // Assuming the date is in ISO format (YYYY-MM-DD HH:mm:ss)
}

export interface FormSubmissionDetailsByID {
    cruiseCodeFormSubmissionId: number;
    cruiseCodeFormId: number;
    cruiseCodeFormName: string;
    cruiseCodeFormSubmissionNote: string;
    listCruiseCodeFormSubmissionAnswer: FormSubmissionDetailsByIDItem[];
}

export interface FormSubmissionDetailsByIDItem {
    cruiseCodeFormSubmissionAnswerId: number;
    cruiseCodeFormCriteriaId: number;
    cruiseCodeFormCriteriaName: string;
    cruiseCodeFormCriteriaDescription: string;
    cruiseCodeFormCriteriaToolTip: string;
    cruiseCodeFormCategory: string;
    cruiseCodeFormFieldType: string;
    isImageUpload: boolean;
    cruiseCodeFormSubmissionAnswer: string;
    cruiseCodeFormSubmissionImagePath: string;
    answerNotes: string | null;
}
