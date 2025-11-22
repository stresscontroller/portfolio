import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutes } from '../../constants';
import {
    AllocatedDataByFilter,
    AllocatedItem,
    AllocationReleaseTourSearch,
    AllocationUnallocateTourSearch,
    InventoryManagementItem,
    NeededAllocationTourInventoryDetailFilters,
    NeededAllocationTourInventoryFilters,
    NeededAllocationTourInventoryReminderItem,
    NeededAllocationUserPreference,
    RecentlyReleasedInventory,
    ReleaseInventoryListItem,
    ShipDataInfo,
    TourDetails,
    TourInventoryItem,
    UnallocatedTourInventoryItemForm,
    UpdateBulkAllocatedUnallocatedInventories,
    UserInventoryPrefence,
} from '@app/core';
import { map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class InventoryManagementApiService {
    private http = inject(HttpClient);

    getReleaseAllInventory(config: AllocationReleaseTourSearch) {
        return this.http.post<{
            success: boolean;
            data: ReleaseInventoryListItem[];
            error?: string;
        }>(`${ApiRoutes.inventoryManagement}GetReleaseAllInventory`, {
            ...config,
            searchBy: 'ALL',
        });
    }

    getAllocatedDataByFilter(config: AllocatedDataByFilter) {
        return this.http.post<{
            success: boolean;
            data: TourInventoryItem[];
            error?: string;
        }>(`${ApiRoutes.inventoryManagement}GetAllocatedDataByFilter`, {
            ...config,
            shipId: config.shipId !== null ? config.shipId : -1,
        });
    }

    getAllocatedDataByFilterToDelete(config: AllocatedDataByFilter) {
        return this.http.post<{
            success: boolean;
            data: TourInventoryItem[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetAllocatedDataByFilterToDelete`,
            config
        );
    }

    getAllocationUnallocatedTourInventoryList(
        config: AllocationUnallocateTourSearch
    ) {
        const formattedFilters: Record<string, string | number | boolean> = {
            searchType: config.searchType || 'ALL',
            companyId: config.companyId,

            isActive: true,
            startDate: config.startDate,
            endDate: config.endDate,
        };

        if (config.tourId && config.tourId.length > 0) {
            formattedFilters['tourID'] = config.tourId
                ? config.tourId.join(',')
                : ''; // e.g. '3,4,14' (concatentated string for multiple tourIds)
        }

        if (config.portId) {
            formattedFilters['portId'] = config.portId;
        }

        if (config.shipId !== null && config.shipId !== undefined) {
            formattedFilters['ShipId'] = config.shipId;
        }

        if (
            config.shipCompanyId !== null &&
            config.shipCompanyId !== undefined
        ) {
            formattedFilters['ShipCompanyId'] = config.shipCompanyId;
        }
        return this.http.post<{
            success: boolean;
            data: TourInventoryItem[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetAllocationUnallocatedTourInventoryList`,
            undefined,
            {
                params: formattedFilters,
            }
        );
    }

    getUserPreferenceInventoryManagement() {
        return this.http.get<{
            success: boolean;
            data: UserInventoryPrefence;
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetUserPreferenceInventoryManagement`
        );
    }

    getShipData(cuid: string) {
        let params = new HttpParams();
        params = params.append('cuid', cuid);
        return this.http.get<{ data: ShipDataInfo[] }>(
            `${ApiRoutes.dtd}GetShipData`,
            { params: params }
        );
    }

    saveUserPreferenceInventoryManagement(
        userInventoryPrefence: UserInventoryPrefence
    ) {
        return this.http.post<{
            success: boolean;
            data: UserInventoryPrefence;
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}SaveUserPreferenceInventoryManagement`,
            userInventoryPrefence
        );
    }

    saveReleaseInventory(userId: string, ids: string) {
        let params = new HttpParams();
        params = params.append('userId', userId);
        params = params.append('ids', ids);
        return this.http.post<{
            success: boolean;
            data: string;
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}SaveReleaseInventory`,
            {},
            { params }
        );
    }

    deleteMultipleInventory(data: {
        ids: string;
        searchBy: string;
        userId: string;
    }) {
        let params = new HttpParams();
        params = params.append('userId', data.userId);
        params = params.append('searchBy', data.searchBy);
        params = params.append('ids', data.ids);
        return this.http.post<{
            success: boolean;
            data: number[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}DeleteMultipleInventory`,
            {},
            { params }
        );
    }

    saveAllocated(data: AllocatedItem) {
        let params = new HttpParams();
        if (data.shipId !== null) {
            params = params.append('shipId', data.shipId);
        }
        if (data.shipCompanyId !== null) {
            params = params.append('shipCompanyId', data.shipCompanyId);
        }
        params = params.append('ids', data.ids);
        params = params.append('UserId', data.userId);
        return this.http.post<{
            success: boolean;
            data: number[];
            error?: string;
        }>(`${ApiRoutes.inventoryManagement}SaveAllocated`, {}, { params });
    }

    saveUnallocatedTourInventory(data: UnallocatedTourInventoryItemForm) {
        return this.http.post<{
            success: boolean;
            data: string;
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}SaveUnallocatedTourInventory`,
            data
        );
    }

    saveBulkUnallocatedAllocatedTourInventory(
        data: UpdateBulkAllocatedUnallocatedInventories
    ) {
        return this.http.post<{
            success: boolean;
            data: string;
            error?: string;
        }>(`${ApiRoutes.inventoryManagement}SaveAllocatedBulk`, data);
    }

    getNeededAllocationTourInventoryList(
        data: NeededAllocationTourInventoryFilters
    ) {
        return this.http.post<{
            success: boolean;
            data: InventoryManagementItem[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetNeededAllocationTourInventoryList`,
            data
        );
    }

    getNeededAllocationTourInventoryTourList(
        data: NeededAllocationTourInventoryDetailFilters
    ) {
        return this.http.post<{
            success: boolean;
            data: InventoryManagementItem[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetNeededAllocationTourInventoryTourList`,
            data
        );
    }

    saveNeededAllocationTourInventoryReminder(
        data: NeededAllocationTourInventoryReminderItem
    ) {
        return this.http.post<{
            success: boolean;
            data: number[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}SaveNeededAllocationTourInventoryReminder`,
            data
        );
    }

    getNeededAllocationTourInventoryReminderList() {
        return this.http.get<{
            success: boolean;
            data: NeededAllocationTourInventoryReminderItem[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetNeededAllocationTourInventoryReminderList`
        );
    }

    getNeededAllocationUserPreference() {
        return this.http.get<{
            success: boolean;
            data: NeededAllocationUserPreference;
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetUserPreferenceInventoryManagement`
        );
    }

    saveNeededAllocationUserPreference(
        userPreference: NeededAllocationUserPreference
    ) {
        return this.http.post<{
            success: boolean;
            data: NeededAllocationUserPreference;
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}SaveUserPreferenceInventoryManagement`,
            userPreference
        );
    }

    getRecentlyReleasedInventoryList() {
        return this.http.post<{
            success: boolean;
            data: RecentlyReleasedInventory[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetRecentlyReleasedInventoryList`,
            undefined
        );
    }

    sendEmailToReleasedInventories(inventoryIds: number[]) {
        let params = new HttpParams();
        params = params.append('ids', inventoryIds.join());
        return this.http.post<{
            success: boolean;
            data: null;
            errors: string[];
        }>(
            `${ApiRoutes.inventoryManagement}SendEmailToReleasedInventories`,
            undefined,
            { params }
        );
    }

    deleteRecentlyReleasedInventoryList(inventoryIds: number[]) {
        let params = new HttpParams();
        params = params.append('ids', inventoryIds.join());
        return this.http.post<{
            success: boolean;
            data: null;
            errors: string[];
        }>(
            `${ApiRoutes.inventoryManagement}DeleteRecentlyReleasedInventoryList`,
            undefined,
            { params }
        );
    }

    getTourInfo(tourId: number) {
        let params = new HttpParams();
        params = params.append('tourId', tourId);
        params = params.append('includeInactive', false);
        return this.http.get<{
            success: boolean;
            data: TourDetails;
            error?: string;
        }>(`${ApiRoutes.tourInventory}GetTour`, { params });
    }

    getTourImage(tourId: number) {
        return this.getTourInfo(tourId).pipe(
            map((res) => res.data?.shoppingCartImagePath)
        );
    }
}
