export interface UserTrainingDataItem {
    userTrainingId: number;
    trainingId: number;
    trainingName: string;
    trainingCompleted: boolean;
    completionDate: string;
    userId: string;
    companyUniqueId: string;
    isActive: boolean;
    createdDate: boolean;
    modifiedDate: string;
}

export interface TrainingListItem {
    trainingId: number;
    training: string;
}

export interface UserTrainingConfig {
    userTrainingId: number;
    trainingId: number;
    trainingName: string;
    trainingCompleted: boolean;
    completionDate: string;
    userId: string;
    companyUniqueId: string;
    isActive: boolean;
}
