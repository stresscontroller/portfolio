import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import {
    ApiTourInventoryDTDAssignmentModel,
    ApiTourInventoryDTDAssignmentDetails,
    ApiPrelimListData,
    ApiDTDAssignmentPrelimList,
    fromApiAssignments,
    ApiAssignment,
    OTCBookingItem,
    NewOTCBookingItem,
    DTDAssignmentListParam,
    AssignmentParticipationItem,
    AssignmentFilter,
    DTDFilterPreference,
    ApiTourInventoryDTDAssignmentFinalData,
    ApiTourInventoryDTDAssignmentPrelimData,
    TourInventoryDTDAssignmentSpecialNotesModel,
    BookingDetails,
    TourInventoryDetails,
    ApiLinkTourInventory,
    DtdTourTime,
    ApiCancelTourInventory,
    NewBookingImage,
    BookingImage,
} from '../../models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../constants';
import { formatDate } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class DtdApiService {
    private http = inject(HttpClient);

    getAssignmentList(
        companyUniqueId: string,
        assignmentDate: Date = new Date(),
        filters?: AssignmentFilter
    ) {
        const formattedAssignmentDate = formatDate(
            assignmentDate,
            'YYYY-MM-dd',
            'en-US'
        );
        return this.http
            .post<{ data: ApiAssignment[] }>(
                `${ApiRoutes.dtd}GetDTDAssignmentList`,
                {
                    companyId: companyUniqueId,
                    assignmentDate: formattedAssignmentDate,
                    // filters
                    ...({ portIds: filters?.portIds } || {}),

                    ...({ tourIds: filters?.tourIds } || {}),
                    driverId:
                        filters && 'driverId' in filters ? filters.driverId : 0,
                    dockId: filters && 'dockId' in filters ? filters.dockId : 0,
                    shipCompanyId:
                        filters && 'shipCompanyId' in filters
                            ? filters.shipCompanyId
                            : null,
                    shipId:
                        filters && 'shipId' in filters ? filters.shipId : null,
                    sortDirection: filters?.sortDirection || 'ASC',
                }
            )
            .pipe(map((res) => fromApiAssignments(res.data)));
    }

    saveTourInventoryDTDAssignmentDetailsBulk(
        data: ApiTourInventoryDTDAssignmentModel[]
    ) {
        return this.http.post<{
            success: boolean;
            data: ApiTourInventoryDTDAssignmentDetails[];
            error?: string;
        }>(`${ApiRoutes.dtd}SaveTourInventoryDTDAssignmentDetailsBulk`, data);
    }

    getDTDAssignmentPrelimList(data: ApiPrelimListData) {
        return this.http.post<{
            success: boolean;
            data: ApiDTDAssignmentPrelimList[];
            error?: string;
        }>(`${ApiRoutes.dtd}GetDTDAssignmentPrelimList`, data);
    }

    saveTourInventoryDTDAssignmentPrelimDetailsBulk(
        data: ApiTourInventoryDTDAssignmentPrelimData[],
        userId: string
    ) {
        let params = new HttpParams();
        params = params.append('userId', userId);
        return this.http.post<{
            success: boolean;
            data: ApiTourInventoryDTDAssignmentPrelimData[];
            error?: string;
        }>(
            `${ApiRoutes.dtd}SaveTourInventoryDTDAssignmentDetailsBulk_Prelim`,
            data,
            {
                params: params,
            }
        );
    }

    saveTourInventoryDTDAssignmentFinalDetailsBulk(
        data: ApiTourInventoryDTDAssignmentFinalData[],
        userId: string
    ) {
        let params = new HttpParams();
        params = params.append('userId', userId);
        return this.http.post<{
            success: boolean;
            data: ApiTourInventoryDTDAssignmentFinalData[];
            error?: string;
        }>(
            `${ApiRoutes.dtd}SaveTourInventoryDTDAssignmentDetailsBulk_Final`,
            data,
            {
                params: params,
            }
        );
    }

    saveTourInventoryDTDAssignmentDetails(
        data: ApiTourInventoryDTDAssignmentModel
    ) {
        return this.http.post<{
            success: boolean;
            data: ApiTourInventoryDTDAssignmentDetails;
            error?: string;
        }>(`${ApiRoutes.dtd}SaveTourInventoryDTDAssignmentDetails`, data);
    }

    openTourInventoryDTDAssignment(tourInventoryId: number) {
        return this.http.post<{
            success: boolean;
            data: number[];
            error?: string;
        }>(`${ApiRoutes.dtd}OpenTourInventoryDTDAssignment`, [tourInventoryId]);
    }

    insertUpdateOTCBooking(item: NewOTCBookingItem) {
        return this.http.post<{
            success: boolean;
            data: number[];
            error?: string;
        }>(`${ApiRoutes.dtd}InsertUpdateOTCBooking`, item);
    }

    getDTDAssignmentBookingList(companyId: string, tourInventoryID: number) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('tourInventoryID', tourInventoryID);
        return this.http.get<{ data: OTCBookingItem[] }>(
            `${ApiRoutes.dtd}GetDTDAssignmentBookingList`,
            { params: params }
        );
    }

    sharePDFDTDAssignmentList(item: DTDAssignmentListParam) {
        return this.http.post<{
            success: boolean;
            error?: string;
        }>(`${ApiRoutes.dtd}SharePDFDTDAssignmentList`, item);
    }

    updateSpecialNotes(config: TourInventoryDTDAssignmentSpecialNotesModel) {
        return this.http.post<{
            success: boolean;
            data: number[];
            error?: string;
        }>(
            `${ApiRoutes.dtd}SaveTourInventoryDTDAssignmentSpecialNotes`,
            config
        );
    }

    saveAssignmentParticipation(item: AssignmentParticipationItem[]) {
        return this.http.post<{ success: boolean; error?: string }>(
            `${ApiRoutes.dtd}SaveAssignmentParticipation`,
            item
        );
    }

    deleteOTCBooking(bookingId: number, createdBy: string) {
        let params = new HttpParams();
        params = params.append('BookingId', bookingId);
        params = params.append('CreatedBy', createdBy);
        return this.http.post<{
            success: boolean;
            data: number[];
            error?: string;
        }>(`${ApiRoutes.dtd}DeleteOTCBooking`, null, { params: params });
    }

    getFilterUserPreference(companyId: string, userId: string) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('userId', userId);
        return this.http.get<{
            success: boolean;
            data: DTDFilterPreference;
            errors?: string[];
        }>(`${ApiRoutes.dtd}GetDTDUserPreference`, {
            params,
        });
    }

    saveFilterUserPreference(filter: DTDFilterPreference) {
        return this.http.post<{
            success: boolean;
            data: boolean;
            errors?: string[];
        }>(`${ApiRoutes.dtd}SaveDTDUserPreferences`, filter);
    }

    checkinBooking(bookingId: number) {
        let params = new HttpParams();
        params = params.append('BookingId', bookingId);
        return this.http.post<{
            success: boolean;
            errors: string[];
            errorCode: string | null;
            errorTitle: string | null;
        }>(`${ApiRoutes.dtd}CheckInGuestsForBookingId`, null, { params });
    }

    getBooking(bookingId: number) {
        let params = new HttpParams();
        params = params.append('bookingId', bookingId);
        return this.http.get<{ data: BookingDetails[] }>(
            `${ApiRoutes.tourInventory}GetBookingByBookingId`,
            {
                params,
            }
        );
    }

    getTourInventoryDetails(tourInventoryId: number) {
        let params = new HttpParams();
        params = params.append('tourInventoryId', tourInventoryId);

        return this.http.get<{
            success: boolean;
            data: TourInventoryDetails;
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetTourInventoryDetail`, {
            params: params,
        });
    }

    updateActualDepartureTime(
        tourInventoryId: number,
        actualDepartureTime: string
    ) {
        return this.http.post<{
            success: boolean;
            errors: string[];
            errorCode: string | null;
            errorTitle: string | null;
        }>(`${ApiRoutes.dtd}UpdateTourInventoryActualDepartureTime`, {
            tourInventoryId,
            actualDepartureTime,
        });
    }

    linkTourInventory(config: ApiLinkTourInventory) {
        return this.http.post<{
            success: boolean;
            error?: string;
        }>(`${ApiRoutes.dtd}SaveTourInventoryLink`, config);
    }

    cancelTourInventory(config: ApiCancelTourInventory) {
        let params = new HttpParams();
        params = params.append('TourInventoryId', config.tourInventoryId);
        params = params.append('CancellationReason', config.cancellationReason);
        params = params.append(
            'CancellationReasonNotes',
            config.cancellationReasonNotes
        );
        params = params.append('IsCancelled', true);
        return this.http.post<{
            success: boolean;
            error?: string;
        }>(`${ApiRoutes.dtd}CancelTourInventory`, null, {
            params,
        });
    }

    revertCancelTourInventory(tourInventoryId: number) {
        let params = new HttpParams();
        params = params.append('TourInventoryId', tourInventoryId);
        params = params.append('IsCancelled', false);
        return this.http.post<{
            success: boolean;
            error?: string;
        }>(`${ApiRoutes.dtd}CancelTourInventory`, null, {
            params,
        });
    }

    getDtdTourTimes(
        companyId: string,
        tourId: number,
        portId: number | null,
        totalSeats: number,
        bookingDate: string
    ) {
        let params = new HttpParams();
        params = params.append('CompanyId', companyId);
        params = params.append('TourId', tourId);
        if (portId) {
            params = params.append('portId', portId);
        }
        params = params.append('TotalSeats', totalSeats);
        params = params.append('bookingDate', bookingDate);
        return this.http.get<{
            success: boolean;
            data: DtdTourTime[];
            error?: string;
        }>(`${ApiRoutes.dtd}GetTourInventoryTimeList`, {
            params: params,
        });
    }

    // Booking Images

    getBookingImages(bookingId: number) {
        let params = new HttpParams();
        params = params.append('bookingID', bookingId);
        return this.http.get<{
            success: boolean;
            data: BookingImage[];
            errors?: string[];
        }>(`${ApiRoutes.dtd}GetBookingImageList`, {
            params: params,
        });
    }

    saveBookingImage(newBookingImage: NewBookingImage) {
        const formData = new FormData();
        formData.append('BookingID', newBookingImage.bookingId.toString());
        formData.append(
            'BookingImage',
            newBookingImage.bookingImage,
            newBookingImage.bookingImagePath
        );
        formData.append('BookingImagePath', newBookingImage.bookingImagePath);
        formData.append('CreatedBy', newBookingImage.createdBy);
        formData.append('ImageId', newBookingImage.imageId);
        return this.http.post<{
            success: boolean;
            errors?: string[];
        }>(`${ApiRoutes.dtd}SaveBookingImage`, formData);
    }

    deleteBookingImage(imageId: number) {
        return this.http.post<{
            success: boolean;
            errors?: string[];
        }>(`${ApiRoutes.dtd}DeleteBookingImage`, {
            id: imageId,
            isActive: false,
        });
    }
}
