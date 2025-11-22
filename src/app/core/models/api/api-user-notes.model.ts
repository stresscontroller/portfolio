export interface UserNotesListItem {
    userNoteId: number;
    notes: string;
    createdDate: string;
}

export interface UserListItem {
    userId: string;
    userName: string;
    userRole: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface UserListConfig {
    companyId: string;
    search?: string;
    showInActive: boolean;
}

export interface UserNoteConfig {
    userNoteId?: number;
    notes: string;
    userId: string;
    companyId: string;
    createdBy: string;
}
