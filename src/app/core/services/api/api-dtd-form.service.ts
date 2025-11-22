import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../constants';
import {
    FormCriteriaItem,
    FormListItem,
    FormCriteriaDetails,
    FormSubmissionDetails,
    FormSubmissionListItem,
    FormSubmissionDetailsByID,
} from '../../models';

@Injectable({
    providedIn: 'root',
})
export class DtdFormService {
    private http = inject(HttpClient);
    constructor() {}

    getCruiseCodeFormCriteriaList() {
        return this.http.get<{
            success: boolean;
            data: FormCriteriaItem[];
            error?: string;
        }>(`${ApiRoutes.form}GetCruiseCodeFormCriteriaList`);
    }

    getCruiseCodeFormList(companyUniqueId: string) {
        let params = new HttpParams();
        params = params.append('companyUniqueId', companyUniqueId);
        return this.http.get<{
            success: boolean;
            data: FormListItem[];
            error?: string;
        }>(`${ApiRoutes.form}GetCruiseCodeFormList`, { params });
    }

    getCruiseCodeFormToCriteriaListByFormId(formId: number) {
        let params = new HttpParams();
        params = params.append('formId', formId);
        return this.http.get<{
            success: boolean;
            data: FormCriteriaDetails[];
            error?: string;
        }>(`${ApiRoutes.form}GetCruiseCodeFormToCriteriaListByFormId`, {
            params,
        });
    }

    getCruiseCodeFormSubmissionList(companyId: string) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        return this.http.get<{
            success: boolean;
            data: FormSubmissionListItem[];
            error?: string;
        }>(`${ApiRoutes.form}GetCruiseCodeFormSubmissionList`, { params });
    }

    getCruiseCodeFormSubmissionById(cruiseCodeFormSubmissionId: number) {
        let params = new HttpParams();
        params = params.append(
            'CruiseCodeFormSubmissionId',
            cruiseCodeFormSubmissionId
        );
        return this.http.get<{
            success: boolean;
            data: FormSubmissionDetailsByID;
            error?: string;
        }>(`${ApiRoutes.form}GetCruiseCodeFormSubmissionById`, { params });
    }

    saveCruiseCodeForm(formDetails: FormCriteriaDetails) {
        return this.http.post<{
            success: boolean;
            error?: string;
        }>(`${ApiRoutes.form}SaveCruiseCodeForm`, formDetails);
    }

    saveCruiseCodeFormSubmission(formDetails: FormSubmissionDetails) {
        return this.http.post<{
            success: boolean;
            error?: string;
        }>(`${ApiRoutes.form}SaveCruiseCodeFormSubmission`, formDetails);
    }
}
