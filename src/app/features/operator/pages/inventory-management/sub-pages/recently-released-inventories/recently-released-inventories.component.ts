import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { InventoryListComponent, InventoryTableComponent } from './components';
import { DividerModule } from 'primeng/divider';
import { RecentlyReleasedInventoriesState } from './state';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { InventoryManagementState } from '../state';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Features } from '@app/core';
import { FormsModule } from '@angular/forms';
import { FilterService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    standalone: true,
    selector: 'app-recently-released-inventories',
    templateUrl: './recently-released-inventories.component.html',
    styleUrls: ['./recently-released-inventories.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        DividerModule,
        LoaderEmbedComponent,
        PermissionDirective,
        InventoryListComponent,
        InventoryTableComponent,
    ],
    providers: [RecentlyReleasedInventoriesState],
})
export class RecentlyReleasedInventoriesComponent {
    filterService = inject(FilterService);
    recentlyReleasedInventoriesState = inject(RecentlyReleasedInventoriesState);
    inventoryManagementState = inject(InventoryManagementState);
    status$ = this.recentlyReleasedInventoriesState.status$;
    features = Features;

    actionIsLoading$ = this.recentlyReleasedInventoriesState.status$.pipe(
        map(
            (status) =>
                status.sendEmail === 'loading' ||
                status.deleteInventory === 'loading'
        )
    );
    recentlyReleasedInventories$ =
        this.inventoryManagementState.recentlyReleasedInventories$.pipe(
            switchMap((inventories) => {
                return this.keyword$.pipe(
                    map((searchString) => {
                        if (!inventories || inventories.length === 0) {
                            return [];
                        }
                        if (!searchString) {
                            return inventories;
                        }
                        return this.filterService.filter(
                            inventories,
                            ['shipCompanyName', 'shipName'],
                            searchString,
                            'contains'
                        );
                    })
                );
            })
        );

    recentlyReleasedInventoriesStatus$ =
        this.inventoryManagementState.status$.pipe(
            map((status) => status.loadInventories)
        );

    selectedInventories: number[] = [];
    keyword: string = '';
    keyword$ = new BehaviorSubject<string>('');

    search(): void {
        this.keyword$.next(this.keyword);
    }

    onInventoriesSelected(inventories: number[]): void {
        this.selectedInventories = inventories;
    }

    bulkDismiss(): void {
        if (this.selectedInventories.length === 0) {
            return;
        }
        this.recentlyReleasedInventoriesState
            .deleteRecentlyReleasedInventoryList(this.selectedInventories)
            .then(() => {
                this.selectedInventories = [];
            })
            .catch(() => {
                // error is handled internally
            });
    }

    bulkNotify(): void {
        if (this.selectedInventories.length === 0) {
            return;
        }
        this.recentlyReleasedInventoriesState
            .sendEmailToReleasedInventories(this.selectedInventories)
            .then(() => {
                this.selectedInventories = [];
            })
            .catch(() => {
                // error is handled internally
            });
    }

    dismiss(unallocatedTourInventoryId: number): void {
        this.recentlyReleasedInventoriesState
            .deleteRecentlyReleasedInventoryList([unallocatedTourInventoryId])
            .catch(() => {
                // error is handled internally
            });
    }

    notify(unallocatedTourInventoryId: number): void {
        this.recentlyReleasedInventoriesState
            .sendEmailToReleasedInventories([unallocatedTourInventoryId])
            .catch(() => {
                // error is handled internally
            });
    }
}
