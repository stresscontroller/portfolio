import { Component, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { UIState } from '../../../state';
import {
    Subject,
    distinctUntilChanged,
    filter,
    lastValueFrom,
    map,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { AllocationState } from '../../../state';
import {
    InventoryManagementApiService,
    InventoryManagementItem,
    NeededAllocationTourInventoryReminderItem,
    addWeeks,
    adjustDate,
} from '@app/core';
import { FormsModule } from '@angular/forms';
@Component({
    standalone: true,
    selector: 'app-allocation-reminder-modal',
    templateUrl: './allocation-reminder.component.html',
    styleUrls: ['./allocation-reminder.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        DividerModule,
        RadioButtonModule,
        CalendarModule,
        FormsModule,
    ],
})
export class AllocationReminderComponent {
    uiState = inject(UIState);
    allocationState = inject(AllocationState);
    inventoryManagementApiService = inject(InventoryManagementApiService);
    tourImage = '';
    optionRadio = '1 Week';
    reminderDate = new Date();

    reminderOptions = [
        {
            label: '1 Week',
            value: '1 Week',
        },
        {
            label: '1 Month',
            value: '1 Month',
        },
        {
            label: '6 Months',
            value: '6 Months',
        },
    ];

    setReminderModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.setReminder),
        distinctUntilChanged()
    );

    isOpen$ = this.setReminderModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.setReminderModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.context$.subscribe(async (context) => {
            this.tourImage = '';
            if (context?.tourID) {
                try {
                    this.tourImage = await lastValueFrom(
                        this.inventoryManagementApiService.getTourImage(
                            context.tourID
                        )
                    );
                } catch (err) {
                    // swallow error
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    close(): void {
        this.uiState.closeSetReminderModal();
    }

    save(reminderItem: InventoryManagementItem): void {
        // begin date
        let beginDate = '';
        switch (this.optionRadio) {
            case '1 Week': {
                beginDate = formatDate(
                    adjustDate(new Date(addWeeks(this.reminderDate, 1))),
                    'YYYY-MM-dd',
                    'en-US'
                );
                break;
            }
            case '1 Month': {
                beginDate = formatDate(
                    adjustDate(new Date(addWeeks(this.reminderDate, 4))),
                    'YYYY-MM-dd',
                    'en-US'
                );
                break;
            }
            case '6 Months': {
                beginDate = formatDate(
                    adjustDate(new Date(addWeeks(this.reminderDate, 24))),
                    'YYYY-MM-dd',
                    'en-US'
                );
                break;
            }
            default: {
                beginDate = formatDate(
                    adjustDate(this.reminderDate),
                    'YYYY-MM-dd',
                    'en-US'
                );
                break;
            }
        }

        const formattedItem: NeededAllocationTourInventoryReminderItem = {
            companyId: '',
            tourId: reminderItem.tourID,
            shipId: reminderItem.shipId || -1,
            tourDate: formatDate(
                new Date(reminderItem.tourInventoryDateString),
                'YYYY-MM-dd',
                'en-US'
            ),
            isIgnored: false,
            isRemindLater: true,
            reminderBeginDate: beginDate,
        };

        this.allocationState.setReminder(formattedItem).then(() => {
            this.allocationState.refresh();
            this.close();
        });
    }
}
