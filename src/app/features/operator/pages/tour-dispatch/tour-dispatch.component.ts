import { CommonModule, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    HardcodeDirective,
    LoaderEmbedComponent,
    PermissionDirective,
} from '@app/shared';
import {
    DtdTableControlsComponent,
    AddOtcModalComponent,
    ConfirmGuestsModalComponent,
    SharePdfComponent,
    UpdateStatusModalComponent,
    DeleteOtcBookingComponent,
    DtdTableCondensedComponent,
    DtdGridViewComponent,
    NotificationBannerComponent,
    BookingListModalComponent,
    UpdateTransportationModalComponent,
    EditBookingModalComponent,
    AssignmentNotesModalComponent,
    UpdatePrelimsModalComponent,
    CheckInModalComponent,
    UpdateDepartureTimeModalComponent,
    JoinDeparturesModalComponent,
    TicketCameraModalComponent,
} from './components';
import {
    AssignmentsState,
    UserActionsState,
    UIState,
    BookingState,
} from './state';
import {
    Subject,
    combineLatest,
    debounceTime,
    filter,
    map,
    takeUntil,
} from 'rxjs';
import { DividerModule } from 'primeng/divider';
import { SidebarModule } from 'primeng/sidebar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AssignmentFilter, Features, adjustDate } from '@app/core';
import { ViewOption } from './state/assignments.state';

@Component({
    standalone: true,
    selector: 'app-tour-dispatch',
    templateUrl: './tour-dispatch.component.html',
    styleUrls: ['../../operator.scss', './tour-dispatch.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        SidebarModule,
        DividerModule,
        HardcodeDirective,
        DtdTableControlsComponent,
        LoaderEmbedComponent,
        DtdTableCondensedComponent,
        DtdGridViewComponent,
        PermissionDirective,

        // Modals
        AddOtcModalComponent,
        ConfirmGuestsModalComponent,
        SharePdfComponent,
        UpdateStatusModalComponent,
        DeleteOtcBookingComponent,
        BookingListModalComponent,
        NotificationBannerComponent,
        UpdateTransportationModalComponent,
        EditBookingModalComponent,
        AssignmentNotesModalComponent,
        UpdatePrelimsModalComponent,
        UpdateDepartureTimeModalComponent,
        CheckInModalComponent,
        JoinDeparturesModalComponent,
        TicketCameraModalComponent,
    ],
    providers: [AssignmentsState, BookingState],
})
export class TourDispatchComponent {
    assignmentsState = inject(AssignmentsState);
    uiState = inject(UIState);
    userActionsState = inject(UserActionsState);
    activatedRoute = inject(ActivatedRoute);
    router = inject(Router);
    features = Features;
    isUpdating$ = this.assignmentsState.status$.pipe(
        map((status) => {
            return (
                status.updateAssignment === 'loading' ||
                status.updateDockOrDriver === 'loading' ||
                status.updatePrelim === 'loading' ||
                status.updateFinal === 'loading' ||
                status.updateTransportation === 'loading'
            );
        })
    );
    isRefreshing$ = this.assignmentsState.status$.pipe(
        map((status) => status.loadAssignments === 'loading')
    );
    viewMode$ = this.assignmentsState.configs$.pipe(
        map((config) => {
            return config.viewMode;
        })
    );
    errorUpdatingAssignments$ = this.assignmentsState.status$.pipe(
        map((status) => {
            return (
                status.updateAssignment === 'error' ||
                status.updateDockOrDriver === 'error' ||
                status.updatePrelim === 'error' ||
                status.updateFinal === 'error' ||
                status.updateTransportation === 'error'
            );
        })
    );
    dataDescription$ = combineLatest([
        this.assignmentsState.assignments$,
        this.isRefreshing$,
        this.assignmentsState.configs$.pipe(
            map((config) => config.assignmentsLastUpdated)
        ),
    ]).pipe(
        filter(
            ([_assignments, isLoading, _assignmentsLastUpdated]) => !isLoading
        ),
        debounceTime(200),
        map(([assignments, _isLoading, assignmentsLastUpdated]) => {
            if (assignments?.length > 0) {
                const assignmentsCount = assignments.length;
                let lastUpdatedString = '';
                if (assignmentsLastUpdated) {
                    lastUpdatedString =
                        formatDate(
                            assignmentsLastUpdated,
                            `MMM dd, yyyy 'at' hh:mm a`,
                            'en'
                        ) || '';
                }
                if (assignmentsCount === 1) {
                    return `Displaying ${assignmentsCount} result. Last updated on ${lastUpdatedString}.`;
                } else {
                    return `Displaying ${assignmentsCount} results. Last updated on ${lastUpdatedString}.`;
                }
            }
            return '';
        })
    );
    selectedViewOption: ViewOption = 'grid';

    private destroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.userActionsState.init();
        this.assignmentsState.init();
        combineLatest([
            this.activatedRoute.params,
            this.activatedRoute.queryParamMap,
        ])
            .pipe(takeUntil(this.destroyed$))
            .subscribe(([params, queryParams]) => {
                const dateParams = params['date'];
                let selectedDate = new Date(); // default to today's date
                let redirectToRoot = false;
                if (dateParams) {
                    const parsedDateParams = new Date(dateParams);
                    const localDate = adjustDate(parsedDateParams);

                    if (localDate?.toString() !== 'Invalid Date') {
                        selectedDate = localDate;
                    } else {
                        redirectToRoot = true;
                    }
                }

                const filters = queryParams.get('filters');
                if (filters) {
                    try {
                        const parsedFilters = JSON.parse(
                            atob(filters)
                        ) as AssignmentFilter;
                        this.assignmentsState.setAssignmentFilters(
                            parsedFilters,
                            selectedDate
                        );
                    } catch {
                        if (redirectToRoot) {
                            this.router.navigate(['/operator/filter']);
                        } else {
                            this.router.navigate([
                                `/operator/filter/${selectedDate || ''}`,
                            ]);
                        }
                    }
                } else {
                    // reset filter to default saved preference if redirecting to root
                    this.assignmentsState.loadSavedFilterPreference();
                    if (redirectToRoot) {
                        this.router.navigate(['/operator/filter']);
                    } else {
                        this.assignmentsState.setDateSelected(selectedDate);
                    }
                }

                const autoRefresh = queryParams.get('autoRefresh');
                this.assignmentsState.setAutoRefresh(autoRefresh === 'true');
                const view = queryParams.get('view');
                this.assignmentsState.setViewMode(view);
                const hideConfirmedAndCanceled = queryParams.get(
                    'hideConfirmedAndCanceled'
                );
                this.assignmentsState.setHideConfirmedAndCanceled(
                    hideConfirmedAndCanceled === 'true'
                );
                this.assignmentsState.refresh();
            });

        this.isUpdating$
            .pipe(takeUntil(this.destroyed$))
            .subscribe((isUpdating) => {
                if (isUpdating) {
                    this.uiState.openNotificationBanner({
                        text: 'Updating assignments...',
                        status: 'loading',
                    });
                } else {
                    this.uiState.closeNotificationBanner();
                }
            });

        this.errorUpdatingAssignments$
            .pipe(takeUntil(this.destroyed$))
            .subscribe((isError) => {
                if (isError) {
                    this.uiState.openNotificationBanner({
                        text: 'Error updating assignments',
                        status: 'error',
                    });
                }
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    selectViewOption(viewMode: ViewOption): void {
        this.assignmentsState.searchAssignments(
            this.assignmentsState.configs$.getValue().filters || null,
            {
                autoRefresh:
                    this.assignmentsState.configs$.getValue().autoRefresh,
                viewMode,
            }
        );
    }
    openCheckInModal(): void {
        this.uiState.openCheckInModal();
    }
}
