import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../constants';
import {
    TourServiceDetailsConfig,
    TourServiceItineraryConfig,
    TourServiceRefundPolicyConfig,
    TourServiceIncludedConfig,
    TourPriceDetails,
    TourPriceDetailsConfig,
    TourItinerary,
    TourServiceItineraryListConfig,
    TourGalleryItem,
    TourVideoItem,
} from '@app/core';

@Injectable({
    providedIn: 'root',
})
export class TourServicesApiService {
    private http = inject(HttpClient);
    constructor() {}

    saveTourDetail(config: TourServiceDetailsConfig) {
        return this.http.post<{
            success: boolean;
            data: TourServiceDetailsConfig;
            error?: string;
        }>(`${ApiRoutes.admin}SaveTourDetail`, config);
    }

    saveTourRefundPolicy(config: TourServiceRefundPolicyConfig) {
        return this.http.post<{
            success: boolean;
            data: TourServiceRefundPolicyConfig;
            error?: string;
        }>(`${ApiRoutes.admin}SaveTourRefundPolicy`, config);
    }

    saveTourItinerary(config: TourServiceItineraryConfig) {
        return this.http.post<{
            success: boolean;
            data: number;
            error?: string;
        }>(`${ApiRoutes.admin}SaveTourItinerary`, config);
    }

    saveTourItineraryList(config: TourServiceItineraryListConfig) {
        return this.http.post<{
            success: boolean;
            data: TourItinerary[];
            error?: string;
        }>(`${ApiRoutes.admin}SaveTourItineraryList`, config);
    }

    deleteTourItinerar(id: number) {
        let params = new HttpParams();
        params = params.append('TourItineraryId', id.toString());

        return this.http.post<{
            success: boolean;
            data: TourItinerary[];
            error?: string;
        }>(`${ApiRoutes.admin}DeleteTourItinerary`, undefined, {
            params: params,
        });
    }

    saveTourWhatsInclude(config: TourServiceIncludedConfig) {
        return this.http.post<{
            success: boolean;
            data: TourServiceIncludedConfig;
            error?: string;
        }>(`${ApiRoutes.admin}SaveTourWhatsInclude`, config);
    }

    saveTourPrice(config: TourPriceDetailsConfig) {
        return this.http.post<{
            success: boolean;
            data: TourPriceDetails;
            error?: string;
        }>(`${ApiRoutes.admin}SaveTourPrice`, config);
    }

    deleteTourPrice(id: number) {
        let params = new HttpParams();
        params = params.append('id', id.toString());

        return this.http.post<{
            success: boolean;
            data: TourPriceDetails;
            error?: string;
        }>(`${ApiRoutes.admin}DeleteTourPrice`, undefined, { params: params });
    }

    getTourImages(tourId: number) {
        let params = new HttpParams();
        params = params.append('tourId', tourId);
        return this.http.get<{
            success: boolean;
            data: TourGalleryItem[];
            error?: string;
        }>(`${ApiRoutes.admin}GetTourImagesList`, { params: params });
    }

    saveTourImage(config: FormData) {
        return this.http.post<{
            success: boolean;
            data: TourGalleryItem[];
            errors?: string;
        }>(`${ApiRoutes.admin}SaveTourImage`, config);
    }

    deleteTourImage(config: number) {
        let params = new HttpParams();
        params = params.append('Id', config);
        return this.http.post<{
            success: boolean;
            data: TourGalleryItem[];
            error?: string;
        }>(`${ApiRoutes.admin}DeleteTourImage`, undefined, {
            params: params,
        });
    }

    saveTourVideo(config: FormData) {
        return this.http.post<{
            success: boolean;
            data: TourVideoItem[];
            errors?: string;
        }>(`${ApiRoutes.admin}SaveTourVideo`, config);
    }

    deleteTourVideo(config: number) {
        let params = new HttpParams();
        params = params.append('Id', config);
        return this.http.post<{
            success: boolean;
            data: TourVideoItem[];
            error?: string;
        }>(`${ApiRoutes.admin}DeleteTourVideo`, undefined, {
            params: params,
        });
    }
}
