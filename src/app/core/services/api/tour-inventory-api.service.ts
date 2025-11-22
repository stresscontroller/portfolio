import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StatesList, CountryList, ApiRoutes } from '@app/core';
import {
    FAQCategory,
    PolicyConfig,
    RefundPolicy,
    AddOnsItem,
    TourItem,
    SaveTourDetailsConfig,
    TourDetails,
    TourPriceDetails,
    TourDeleteConfig,
    TourSaveConfig,
    BookingDetails,
    ApiPickupLocationItem,
    TourTimes,
    ReviewComment,
    ReviewCount,
    TourInventoryDetails,
    ShipByTour,
    TourInventoryUpdate,
} from '../../models';

@Injectable({
    providedIn: 'root',
})
export class TourInventoryApiService {
    private http = inject(HttpClient);

    getCountryList() {
        return this.http.get<{
            success: boolean;
            data: CountryList[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetCountryList`);
    }

    getStateList(CountryId: number) {
        let params = new HttpParams();
        params = params.append('CountryId', CountryId);
        return this.http.get<{
            success: boolean;
            data: StatesList[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetStateList`, { params: params });
    }

    getBooking(reservationBookingId: string) {
        let params = new HttpParams();
        params = params.append('reservationBookingId', reservationBookingId);

        return this.http.get<{
            success: boolean;
            data: BookingDetails[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetBooking`, { params: params });
    }

    getPickUpLocationList(tourId: number, isArrivingByCruise: boolean) {
        let params = new HttpParams();
        params = params.append('tourId', tourId);
        params = params.append('isArrivingByCruise', isArrivingByCruise);
        return this.http.get<{
            success: boolean;
            data: ApiPickupLocationItem[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetPickUpLocationList`, {
            params: params,
        });
    }

    getPickUpLocationListByTourInventoryId(
        tourInventoryId: number,
        isArrivingByCruise: boolean
    ) {
        let params = new HttpParams();
        params = params.append('tourInventoryId', tourInventoryId);
        params = params.append('isArrivingByCruise', isArrivingByCruise);
        return this.http.get<{
            success: boolean;
            data: ApiPickupLocationItem[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetPickUpLocationList`, {
            params: params,
        });
    }

    getTourDetail1(tourId: number) {
        let params = new HttpParams();
        params = params.append('tourId', tourId);
        return this.http.get<{
            success: boolean;
            data: TourDetails;
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetTour`, { params: params });
    }

    getTourTimes(
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
            data: TourTimes[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetTourInventoryTimeList`, {
            params: params,
        });
    }

    getTourReviews(tourId: number) {
        let params = new HttpParams();
        params = params.append('tourId', tourId);
        return this.http.get<{
            success: boolean;
            data: ReviewComment[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetTourReviewList`, { params: params });
    }

    getTourReviewCount(tourId: number) {
        let params = new HttpParams();
        params = params.append('tourId', tourId);
        return this.http.get<{
            success: boolean;
            data: ReviewCount;
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetTourReviewCount`, { params: params });
    }

    getTourDetail(tourInventoryID: number, IsArrivingByCruise: boolean) {
        let params = new HttpParams();
        params = params.append('tourInventoryID', tourInventoryID);
        params = params.append('IsArrivingByCruise', IsArrivingByCruise);
        return this.http.get<{
            success: boolean;
            data: TourInventoryDetails;
            errors?: string[];
        }>(`${ApiRoutes.tourInventory}GetTourInventoryDetail`, {
            params: params,
        });
    }

    getShipListByTourId(
        companyId: string,
        tourId: number,
        inventoryDate: string
    ) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        params = params.append('tourId', tourId);
        params = params.append('inventoryDate', inventoryDate);
        return this.http.get<{
            success: boolean;
            data: ShipByTour[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetShipList`, {
            params: params,
        });
    }

    getRefundPolicies() {
        return this.http.get<{
            success: boolean;
            data: RefundPolicy[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetRefundPolicies`);
    }

    getTourPrices(tourId: number) {
        let params = new HttpParams();
        params = params.append('tourId', tourId);
        return this.http.get<{
            success: boolean;
            data: TourPriceDetails[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetTourPrices`, { params: params });
    }

    getFAQCategories(companyId: string) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        return this.http.get<{
            success: boolean;
            data: FAQCategory[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetFAQCategories`, { params: params });
    }

    getAddons(companyId: string) {
        let params = new HttpParams();
        params = params.append('companyId', companyId);
        return this.http.get<{
            success: boolean;
            data: AddOnsItem[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetAddons`, { params: params });
    }

    getToursByCompanyId(companyId: string, includeInactive: boolean = false) {
        let params = new HttpParams();
        params = params.append('companyUniqueId', companyId);
        params = params.append('includeInactive', includeInactive.toString());
        return this.http.get<{
            success: boolean;
            data: TourDetails[];
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetToursByCompanyId`, { params: params });
    }

    saveTour(config: TourSaveConfig) {
        return this.http.post<{
            success: boolean;
            data: TourDetails[];
            error?: string;
        }>(`${ApiRoutes.admin}SaveTourItinerary`, config);
    }

    deleteTour(config: TourDeleteConfig) {
        return this.http.post<{
            success: boolean;
            data: TourDetails[];
            error?: string;
        }>(`${ApiRoutes.admin}DeleteTour`, config);
    }
    getTourDetails(tourId: number) {
        let params = new HttpParams();
        params = params.append('tourId', tourId);
        return this.http.get<{
            success: boolean;
            data: TourItem;
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetTour`, { params: params });
    }

    saveTourRefundPolicy(config: PolicyConfig) {
        return this.http.post<{
            success: boolean;
            error?: string;
        }>(`${ApiRoutes.admin}SaveTourRefundPolicy`, config);
    }

    saveTourDetails(config: SaveTourDetailsConfig) {
        return this.http.post<{
            success: boolean;
            data: TourDetails;
            error?: string;
        }>(`${ApiRoutes.admin}SaveTourDetail`, config);
    }

    updateTourInventory(tourInventory: TourInventoryUpdate) {
        return this.http.post<{ success: boolean; error?: string }>(
            `${ApiRoutes.admin}SaveTourInventory`,
            tourInventory
        );
    }

    deleteTourInventory(tour: { id: number; isActive: boolean }) {
        return this.http.post<{ success: boolean; error?: string }>(
            `${ApiRoutes.admin}DeleteTourInventory`,
            tour
        );
    }
}
