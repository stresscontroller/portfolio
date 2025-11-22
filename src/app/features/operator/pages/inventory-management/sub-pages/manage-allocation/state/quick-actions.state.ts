import { Injectable, inject } from '@angular/core';
import {
    InventoryManagementApiService,
    UIState,
    UnallocatedTourInventoryItemForm,
    UserState,
} from '@app/core';
import { lastValueFrom } from 'rxjs';
import { ManageAllocationState } from './manage-allocation.state';
import { CalendarTour } from '@app/shared';
import { formatDate } from '@angular/common';
import { TourInventoryItem } from '@app/core';

@Injectable()
export class QuickActionsState {
    inventoryManagementApiService = inject(InventoryManagementApiService);
    manageAllocationState = inject(ManageAllocationState);
    uiState = inject(UIState);
    userState = inject(UserState);

    allocateInventory(
        tour: CalendarTour,
        shipId: number,
        shipCompanyId: number
    ): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }
            return lastValueFrom(
                this.inventoryManagementApiService.saveAllocated({
                    userId: user.id,
                    ids: tour.unallocatedTourInventoryId.toString(),
                    shipCompanyId,
                    shipId,
                })
            ).then((res) => {
                if (res.success === false) {
                    return Promise.reject(res.error);
                }
                this.manageAllocationState.reload();
                return Promise.resolve();
            });
        });
    }

    releaseInventory(tour: CalendarTour): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }
            return lastValueFrom(
                this.inventoryManagementApiService.saveReleaseInventory(
                    user.id,
                    tour.unallocatedTourInventoryId.toString()
                )
            ).then((res) => {
                if (res.success === false) {
                    return Promise.reject(res.error);
                }
                this.manageAllocationState.reload();
                return Promise.resolve();
            });
        });
    }

    deleteInventory(tour: CalendarTour): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }
            return lastValueFrom(
                this.inventoryManagementApiService.deleteMultipleInventory({
                    searchBy: 'ALL',
                    ids: tour.unallocatedTourInventoryId.toString(),
                    userId: user.id,
                })
            ).then((res) => {
                if (res.success === false) {
                    return Promise.reject(res.error);
                }
                this.manageAllocationState.reload();
                return Promise.resolve();
            });
        });
    }

    editAllocatedInventory(
        tour: CalendarTour,
        shipId: number | null,
        shipCompanyId: number | null
    ): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }
            return lastValueFrom(
                this.inventoryManagementApiService.saveAllocated({
                    userId: user.id,
                    ids: tour.unallocatedTourInventoryId.toString(),
                    shipCompanyId,
                    shipId,
                })
            ).then((res) => {
                if (res.success === false) {
                    return Promise.reject(res.error);
                }
                this.manageAllocationState.reload();
                return Promise.resolve();
            });
        });
    }

    editUnallocatedInventory(updatedTourInventory: {
        unallocatedTourInventoryId: number;
        tourId: number;
        seats: number;
        time: Date;
    }): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }
            const unallocatedTourItem: UnallocatedTourInventoryItemForm = {
                unallocatedTourInventoryID:
                    updatedTourInventory.unallocatedTourInventoryId,
                tourID: updatedTourInventory.tourId,
                startDate: formatDate(
                    new Date(updatedTourInventory.time),
                    'YYYY-MM-dd',
                    'en-US'
                ),
                endDate: formatDate(
                    new Date(updatedTourInventory.time),
                    'YYYY-MM-dd',
                    'en-US'
                ),
                unallocatedTourInventoryDate: formatDate(
                    new Date(updatedTourInventory.time),
                    'YYYY-MM-dd',
                    'en-US'
                ),
                isRecurranceUpdate: false,
                unallocatedTourInventoryTime: formatDate(
                    new Date(updatedTourInventory.time),
                    'HH:mm',
                    'en-US'
                ),
                unallocatedTourEndTime: '',
                unallocatedTourInventoryAllocatedSeats:
                    updatedTourInventory.seats,
                isReleased: false,
                intervalHours: '',
                intervalMinutes: '',
                frequency: '',
                createdBy: user.id,
                companyId: user.companyUniqueID ?? '',
                days: '',
            };
            return lastValueFrom(
                this.inventoryManagementApiService.saveUnallocatedTourInventory(
                    unallocatedTourItem
                )
            ).then((res) => {
                if (res.success === false) {
                    return Promise.reject(res.error);
                }
                this.manageAllocationState.reload();
                return Promise.resolve();
            });
        });
    }

    // Table
    deleteTableInventory(tour: TourInventoryItem): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }
            return lastValueFrom(
                this.inventoryManagementApiService.deleteMultipleInventory({
                    searchBy: 'ALL',
                    ids: tour.unallocatedTourInventoryID.toString(),
                    userId: user.id,
                })
            ).then((res) => {
                if (res.success === false) {
                    return Promise.reject(res.error);
                }
                this.manageAllocationState.reload();
                return Promise.resolve();
            });
        });
    }

    allocateTableInventory(
        tour: TourInventoryItem,
        shipId: number,
        shipCompanyId: number
    ): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }
            return lastValueFrom(
                this.inventoryManagementApiService.saveAllocated({
                    userId: user.id,
                    ids: tour.unallocatedTourInventoryID.toString(),
                    shipCompanyId,
                    shipId,
                })
            ).then((res) => {
                if (res.success === false) {
                    return Promise.reject(res.error);
                }
                this.manageAllocationState.reload();
                return Promise.resolve();
            });
        });
    }

    releaseTableInventory(tour: TourInventoryItem): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }
            return lastValueFrom(
                this.inventoryManagementApiService.saveReleaseInventory(
                    user.id,
                    tour.unallocatedTourInventoryID.toString()
                )
            ).then((res) => {
                if (res.success === false) {
                    return Promise.reject(res.error);
                }
                this.manageAllocationState.reload();
                return Promise.resolve();
            });
        });
    }

    editAllocatedTableInventory(
        tour: TourInventoryItem,
        shipId: number | null,
        shipCompanyId: number | null
    ): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }
            return lastValueFrom(
                this.inventoryManagementApiService.saveAllocated({
                    userId: user.id,
                    ids: tour.unallocatedTourInventoryID.toString(),
                    shipCompanyId,
                    shipId,
                })
            ).then((res) => {
                if (res.success === false) {
                    return Promise.reject(res.error);
                }
                this.manageAllocationState.reload();
                return Promise.resolve();
            });
        });
    }

    editUnallocatedTableInventory(updatedTourInventory: {
        unallocatedTourInventoryId: number;
        tourId: number;
        seats: number;
        time: Date;
    }): Promise<void> {
        return this.userState.getAspNetUser().then((user) => {
            if (!user?.id) {
                return Promise.reject('missing userid');
            }
            const unallocatedTourItem: UnallocatedTourInventoryItemForm = {
                unallocatedTourInventoryID:
                    updatedTourInventory.unallocatedTourInventoryId,
                tourID: updatedTourInventory.tourId,
                startDate: formatDate(
                    new Date(updatedTourInventory.time),
                    'YYYY-MM-dd',
                    'en-US'
                ),
                endDate: formatDate(
                    new Date(updatedTourInventory.time),
                    'YYYY-MM-dd',
                    'en-US'
                ),
                unallocatedTourInventoryDate: formatDate(
                    new Date(updatedTourInventory.time),
                    'YYYY-MM-dd',
                    'en-US'
                ),
                isRecurranceUpdate: false,
                unallocatedTourInventoryTime: formatDate(
                    new Date(updatedTourInventory.time),
                    'HH:mm',
                    'en-US'
                ),
                unallocatedTourEndTime: '',
                unallocatedTourInventoryAllocatedSeats:
                    updatedTourInventory.seats,
                isReleased: false,
                intervalHours: '',
                intervalMinutes: '',
                frequency: '',
                createdBy: user.id,
                companyId: user.companyUniqueID ?? '',
                days: '',
            };
            return lastValueFrom(
                this.inventoryManagementApiService.saveUnallocatedTourInventory(
                    unallocatedTourItem
                )
            ).then((res) => {
                if (res.success === false) {
                    return Promise.reject(res.error);
                }
                this.manageAllocationState.reload();
                return Promise.resolve();
            });
        });
    }
}
