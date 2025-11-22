import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
    ApiRoutes,
    FileHeaderTextMapsItem,
    PortMapsItem,
    ShipCompanyShipMapsItem,
    TourMapsItem,
    UploadFileItem,
} from '@app/core';

@Injectable({
    providedIn: 'root',
})
export class FilesMapApiService {
    private http = inject(HttpClient);

    getShipCompanyShipMapsByShipCompanyId(shipCompanyId: number) {
        let params = new HttpParams();
        params = params.append('shipCompanyId', shipCompanyId);
        return this.http.get<{
            success: boolean;
            data: ShipCompanyShipMapsItem[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetShipCompanyShipMapsByShipCompanyId`,
            { params: params }
        );
    }

    getShipCompanyTourMapsByShipCompanyId(shipCompanyId: number) {
        let params = new HttpParams();
        params = params.append('shipCompanyId', shipCompanyId);
        return this.http.get<{
            success: boolean;
            data: TourMapsItem[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetShipCompanyTourMapsByShipCompanyId`,
            { params: params }
        );
    }

    getShipCompanyPortMapsByShipCompanyId(shipCompanyId: number) {
        let params = new HttpParams();
        params = params.append('shipCompanyId', shipCompanyId);
        return this.http.get<{
            success: boolean;
            data: PortMapsItem[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetShipCompanyPortMapsByShipCompanyId`,
            { params: params }
        );
    }

    getShipCompanyFileHeaderTextMapsByShipCompanyId(shipCompanyId: number) {
        let params = new HttpParams();
        params = params.append('shipCompanyId', shipCompanyId);
        return this.http.get<{
            success: boolean;
            data: FileHeaderTextMapsItem[];
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}GetShipCompanyFileHeaderTextMapsByShipCompanyId`,
            { params: params }
        );
    }

    updateInsertShipCompanyFileHeaderTextMap(config: FileHeaderTextMapsItem) {
        return this.http.post<{
            success: boolean;
            data: FileHeaderTextMapsItem;
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}UpdateInsertShipCompanyFileHeaderTextMap`,
            config
        );
    }

    updateInsertShipCompanyShipMap(config: ShipCompanyShipMapsItem) {
        return this.http.post<{
            success: boolean;
            data: ShipCompanyShipMapsItem;
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}UpdateInsertShipCompanyShipMap`,
            config
        );
    }

    updateInsertShipCompanyPortMap(config: PortMapsItem) {
        return this.http.post<{
            success: boolean;
            data: PortMapsItem;
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}UpdateInsertShipCompanyPortMap`,
            config
        );
    }

    updateInsertShipCompanyTourMap(config: TourMapsItem) {
        return this.http.post<{
            success: boolean;
            data: TourMapsItem;
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}UpdateInsertShipCompanyTourMap`,
            config
        );
    }

    deleteShipCompanyFileHeaderTextMap(shipCompanyId: number) {
        let params = new HttpParams();
        params = params.append('shipCompanyId', shipCompanyId);
        return this.http.post<{
            success: boolean;
            data: FileHeaderTextMapsItem;
            error?: string;
        }>(
            `${ApiRoutes.inventoryManagement}DeleteShipCompanyFileHeaderTextMap`,
            {},
            { params: params }
        );
    }

    deleteShipCompanyShipMap(config: ShipCompanyShipMapsItem) {
        return this.http.post<{
            success: boolean;
            data: ShipCompanyShipMapsItem;
            error?: string;
        }>(`${ApiRoutes.inventoryManagement}DeleteShipCompanyShipMap`, config);
    }

    deleteShipCompanyTourMap(config: TourMapsItem) {
        return this.http.post<{
            success: boolean;
            data: TourMapsItem;
            error?: string;
        }>(`${ApiRoutes.inventoryManagement}DeleteShipCompanyTourMap`, config);
    }

    deleteShipCompanyPortMap(config: PortMapsItem) {
        return this.http.post<{
            success: boolean;
            data: PortMapsItem;
            error?: string;
        }>(`${ApiRoutes.inventoryManagement}DeleteShipCompanyPortMap`, config);
    }

    validateAndUploadCruiseLinePreSalesData(
        config: UploadFileItem,
        formDate: FormData
    ) {
        let params = new HttpParams();
        params = params.append('shipCompanyId', config.shipCompanyId);
        params = params.append('shipCompanyName', config.shipCompanyName);
        return this.http.post<string[] | string>(
            `${ApiRoutes.inventoryManagement}ValidateAndUploadCruiseLinePreSalesData`,
            formDate,
            { params: params }
        );
    }
}
