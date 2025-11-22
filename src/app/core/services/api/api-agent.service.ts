import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../constants';
import {
    Agent,
    AgentBookingStatement,
    AgentInvoice,
    AgentInvoicePayment,
    AgentStatementList,
    AgentUser,
    Booking,
    InvoicesModel,
} from '../../models';

@Injectable({
    providedIn: 'root',
})
export class AgentApiService {
    private http = inject(HttpClient);
    getPartnerId() {
        return this.http.get<{
            success: boolean;
            data: number;
            error?: string;
        }>(`${ApiRoutes.agent}GetPartnerId`);
    }
    getAgentDetails(agentId: number) {
        let params = new HttpParams();
        params = params.append('agentId', agentId);
        return this.http.get<{
            success: boolean;
            data: Agent;
            errors?: string[];
        }>(`${ApiRoutes.agent}GetAgentById`, { params: params });
    }
    saveAgentDetails(agentDetails: Agent) {
        return this.http.post<{
            success: boolean;
            data: AgentInvoice;
            error?: string;
        }>(`${ApiRoutes.agent}UpdateAgentProfile`, agentDetails);
    }
    getAgentUserDetail(agentUserId: string) {
        let params = new HttpParams();
        params = params.append('agentUserId', agentUserId);
        return this.http.get<{
            success: boolean;
            data: AgentUser[];
            errors?: string[];
        }>(`${ApiRoutes.agent}GetAgentUserDetail`, { params: params });
    }

    getAssociatedAgents(companyUniqueId: string, isActive: boolean) {
        let params = new HttpParams();
        params = params.append('companyUniqueId', companyUniqueId);
        params = params.append('isActive', isActive);
        return this.http.get<{
            success: boolean;
            data: Agent[];
            errors?: string[];
        }>(`${ApiRoutes.agent}GetAgentsList`, { params: params });
    }

    linkUserToAgent(userId: string, agentId: number) {
        let params = new HttpParams();
        params = params.append('agentId', agentId);
        params = params.append('userId', userId);
        return this.http.post<{
            success: boolean;
            errors?: string[];
        }>(`${ApiRoutes.agent}AddUserAgentMapping`, null, { params });
    }

    unlinkUserFromAgent(userId: string, agentId: number) {
        let params = new HttpParams();
        params = params.append('agentId', agentId);
        params = params.append('userId', userId);
        return this.http.post<{
            success: boolean;
            errors?: string[];
        }>(`${ApiRoutes.agent}DeleteUserAgentMapping`, null, {
            params,
        });
    }

    getAgentStatementListForYear(agentId: number, year: number) {
        let params = new HttpParams();
        params = params.append('agentID', agentId);
        params = params.append('year', year);
        return this.http.get<{
            success: boolean;
            data: AgentStatementList[];
            errors?: string[];
        }>(`${ApiRoutes.agent}GetAgentStatementListForYear`, {
            params: params,
        });
    }

    getAgentStatementsDateRange(
        agentId: number,
        year: number,
        startDate: string,
        endDate: string
    ) {
        let params = new HttpParams();
        params = params.append('agentID', agentId);
        params = params.append('year', year);
        params = params.append('startDate', startDate);
        params = params.append('endDate', endDate);

        return this.http.get<{
            success: boolean;
            data: AgentBookingStatement[];
            errors?: string[];
        }>(`${ApiRoutes.agent}GetAgentStatementsDateRange`, { params: params });
    }

    saveAgentInvoice(agentInvoice: AgentInvoice) {
        return this.http.post<{
            success: boolean;
            data: AgentInvoice;
            error?: string;
        }>(`${ApiRoutes.agent}SaveAgentInvoice`, agentInvoice);
    }

    getInvoices(fromDate: string, toDate: string, agentId: number) {
        let params = new HttpParams();
        params = params.append('agentID', agentId);
        params = params.append('toDate', toDate);
        params = params.append('fromDate', fromDate);
        return this.http.get<{
            success: boolean;
            data: InvoicesModel[];
            errors?: string[];
        }>(`${ApiRoutes.agent}GetInvoices`, { params: params });
    }

    getPayments(startDate: string, endDate: string, agentId: number) {
        let params = new HttpParams();
        params = params.append('agentId', agentId);
        params = params.append('startDate', startDate);
        params = params.append('endDate', endDate);
        return this.http.get<{
            success: boolean;
            data: AgentInvoicePayment[];
            errors?: string[];
        }>(`${ApiRoutes.agent}GetAgentPayments`, { params: params });
    }

    getCompanyPayments(
        startDate: string,
        endDate: string,
        companyUniqueId: string
    ) {
        let params = new HttpParams();
        params = params.append('companyUniqueId', companyUniqueId);
        params = params.append('startDate', startDate);
        params = params.append('endDate', endDate);
        return this.http.get<{
            success: boolean;
            data: AgentInvoicePayment[];
            errors?: string[];
        }>(`${ApiRoutes.agent}GetCompanyPayments`, { params: params });
    }

    saveAgentInvoicePayment(invoicePayment: AgentInvoicePayment) {
        return this.http.post<{
            success: boolean;
            data: AgentInvoicePayment;
            error?: string;
        }>(`${ApiRoutes.agent}SaveAgentInvoicePayment`, invoicePayment);
    }

    getAgentBookingList(agentId: number, includeCancelled = true) {
        let params = new HttpParams();
        params = params.append('agentId', agentId);
        params = params.append('IncludeCancelled', includeCancelled);
        return this.http.get<{
            success: boolean;
            data: Booking[];
            errors?: string[];
        }>(`${ApiRoutes.agent}GetAgentBookingList`, { params: params });
    }

    getAgentBookingListByCompany(companyId: string, includeCancelled = true) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('IncludeCancelled', includeCancelled);
        return this.http.get<{
            success: boolean;
            data: Booking[];
            errors?: string[];
        }>(`${ApiRoutes.agent}GetAgentBookingListByCompany`, {
            params: params,
        });
    }
}
