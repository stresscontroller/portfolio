import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AssignmentsState, UIState } from '../../state';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';
import {
    ApiTourInventoryDTDAssignmentFinalData,
    AppAssignment,
    Features,
    OperatorFiltersState,
    UserState,
    checkPageFeatureAccess,
} from '@app/core';
import { DtdBookingsListComponent } from '../dtd-bookings-list/dtd-bookings-list.component';
import {
    BehaviorSubject,
    Observable,
    Subject,
    combineLatest,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import {
    IconAddJointDepartureComponent,
    IconCruiseComponent,
    IconDepartedComponent,
    IconJointDepartureComponent,
    IconTransportComponent,
    PermissionDirective,
    TourInventoryTimePipe,
} from '@app/shared';
import { DataViewModule } from 'primeng/dataview';
import { BookingListComponent } from './booking-list/booking-list.component';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

@Component({
    standalone: true,
    selector: 'app-dtd-grid-view',
    templateUrl: './dtd-grid-view.component.html',
    styleUrls: ['./dtd-grid-view.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MenuModule,
        ButtonModule,
        DropdownModule,
        TooltipModule,
        InputTextModule,
        AccordionModule,
        DataViewModule,
        DtdBookingsListComponent,
        TourInventoryTimePipe,
        PermissionDirective,
        IconCruiseComponent,
        IconTransportComponent,
        IconDepartedComponent,
        IconJointDepartureComponent,
        IconAddJointDepartureComponent,
        BookingListComponent,
    ],
})
export class DtdGridViewComponent {
    assignmentsState = inject(AssignmentsState);
    operatorFiltersState = inject(OperatorFiltersState);
    uiState = inject(UIState);
    userState = inject(UserState);
    document = inject(DOCUMENT);
    features = Features;

    isScrolling$ = this.assignmentsState.status$.pipe(
        map((status) => status.scrolling === 'loading')
    );
    config$ = this.assignmentsState.configs$;
    equipmentList$ = this.operatorFiltersState.equipmentList$.pipe(
        map((equipments) => {
            return equipments?.map((equipment) => {
                return {
                    ...equipment,
                    displayName: `${equipment.equipmentNumber} - ${equipment.equipmentType} `,
                };
            });
        })
    );
    assignments$ = combineLatest([
        this.assignmentsState.assignments$,
        this.operatorFiltersState.guides$,
        this.equipmentList$,
    ]).pipe(
        map(([assignments, guideList, equipmentList]) => {
            return assignments.map((assignment) => {
                return {
                    ...assignment,
                    specialNotes: assignment.specialNotes?.trim() || '',
                    adjustedDepartureTime: assignment.actualDepartureTime
                        ? new Date(assignment.actualDepartureTime)
                        : null,
                    guideFirstNameNickname: guideList?.find(
                        (guide) =>
                            guide.guideId === assignment.dtdAssignmentGuideId
                    )?.guideFirstNameNickname,
                    equipmentName: equipmentList?.find(
                        (equipment) =>
                            +equipment.equipmentID ===
                            assignment.dtdAssignmentTransportationId
                    )?.displayName,
                    maxCapacity: equipmentList?.find(
                        (equipment) =>
                            +equipment.equipmentID ===
                            assignment.dtdAssignmentTransportationId
                    )?.maxCapacity,
                };
            });
        })
    );

    pendingFinalChanges$ = new BehaviorSubject<
        Record<number, ApiTourInventoryDTDAssignmentFinalData>
    >({});

    activeMenuAssignment$ = new BehaviorSubject<AppAssignment | undefined>(
        undefined
    );
    dataOptions$: Observable<(MenuItem & { displayIndicator?: boolean })[]> =
        combineLatest([
            this.userState.controls$,
            this.activeMenuAssignment$,
        ]).pipe(
            map(([featureControls, activeMenuAssignment]) => {
                if (!activeMenuAssignment) {
                    return [];
                }
                return [
                    {
                        label: 'View Booking',
                        icon: 'pi pi-receipt',
                        command: () => {
                            if (activeMenuAssignment) {
                                const dateSelected =
                                    this.assignmentsState.configs$.getValue()
                                        .dateSelected || new Date();
                                this.uiState.openBookingListModal({
                                    assignment: activeMenuAssignment,
                                    tourDate: dateSelected,
                                });
                            }
                        },
                    },
                    ...(checkPageFeatureAccess(
                        featureControls,
                        Features.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch
                            .features.statusUpdate.name
                    )
                        ? [
                              {
                                  label: 'Update Status',
                                  icon: 'pi pi-folder-open',
                                  command: () => {
                                      if (activeMenuAssignment) {
                                          const dateSelected =
                                              this.assignmentsState.configs$.getValue()
                                                  .dateSelected;
                                          this.uiState.openUpdateStatusModal(
                                              activeMenuAssignment,
                                              dateSelected
                                          );
                                      }
                                  },
                              },
                          ]
                        : []),
                    ...(checkPageFeatureAccess(
                        featureControls,
                        Features.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch
                            .features.addOtcBooking.name
                    )
                        ? [
                              {
                                  label: 'Add OTC Booking',
                                  icon: 'pi pi-plus',
                                  command: () => {
                                      if (activeMenuAssignment) {
                                          this.uiState.openAddOtcModal({
                                              ...activeMenuAssignment,
                                              tourDate:
                                                  this.config$.getValue()
                                                      .dateSelected ||
                                                  new Date(),
                                          });
                                      }
                                  },
                              },
                          ]
                        : []),
                    // accessing prelims is moved to final card (keeping this here in case we need to reactivate)
                    // ...(checkPageFeatureAccess(
                    //     featureControls,
                    //     Features.dailyTourDispatch.name,
                    //     Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                    //     Features.dailyTourDispatch.pages.dailyTourDispatch
                    //         .features.preLimUpdate.name
                    // ) && activeMenuAssignment.shipName !== 'Book Direct'
                    //     ? [
                    //           {
                    //               label: 'Update Prelims',
                    //               icon: 'pi pi-list-check',
                    //               displayIndicator:
                    //                   activeMenuAssignment.preLim !== null,
                    //               command: () => {
                    //                   if (activeMenuAssignment) {
                    //                       this.uiState.openUpdatePrelimsModal({
                    //                           assignment: activeMenuAssignment,
                    //                           tourDate:
                    //                               this.config$.getValue()
                    //                                   .dateSelected ||
                    //                               new Date(),
                    //                       });
                    //                   }
                    //               },
                    //           },
                    //       ]
                    //     : []),
                    ...(checkPageFeatureAccess(
                        featureControls,
                        Features.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch
                            .features.notesView.name
                    )
                        ? [
                              {
                                  label: 'Notes',
                                  icon: 'pi pi-comment',
                                  displayIndicator:
                                      !!activeMenuAssignment.specialNotes,
                                  command: () => {
                                      if (activeMenuAssignment) {
                                          this.uiState.openAssignmentNotesModal(
                                              {
                                                  assignment:
                                                      activeMenuAssignment,
                                                  tourDate:
                                                      this.config$.getValue()
                                                          .dateSelected ||
                                                      new Date(),
                                              }
                                          );
                                      }
                                  },
                              },
                          ]
                        : []),
                    ...(checkPageFeatureAccess(
                        featureControls,
                        Features.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch
                            .features.confirmGuests.name
                    )
                        ? [
                              {
                                  label: 'Confirm Guests',
                                  icon: 'pi pi-user-edit',
                                  command: () => {
                                      if (activeMenuAssignment) {
                                          this.uiState.openConfirmGuestsModal({
                                              assignment: activeMenuAssignment,
                                              tourDate:
                                                  this.config$.getValue()
                                                      .dateSelected ||
                                                  new Date(),
                                          });
                                      }
                                  },
                              },
                          ]
                        : []),
                ];
            })
        );
    private isDestroyed$ = new Subject<void>();
    isVisible = false;

    ngOnInit(): void {
        this.assignmentsState.status$
            .pipe(
                takeUntil(this.isDestroyed$),
                map((status) => status.loadAssignments),
                distinctUntilChanged(),
                tap((status) => {
                    if (status === 'loading') {
                        // prevent the table from flickering when scrolling
                        this.isVisible = false;
                    }
                }),
                filter((status) => status !== 'loading'),
                switchMap(() => {
                    return combineLatest([
                        this.assignments$.pipe(
                            takeUntil(this.isDestroyed$),
                            // filter((assignments) => assignments.length > 0),
                            distinctUntilChanged(
                                (prev, curr) =>
                                    JSON.stringify(prev) ===
                                    JSON.stringify(curr)
                            )
                        ),
                        this.config$.pipe(map((config) => config.autoRefresh)),
                    ]);
                }),
                debounceTime(100)
            )
            .subscribe(([assignments, autoRefresh]) => {
                const currentTime = new Date().getHours() - 1;
                const closestAssignmentIndex = assignments.findIndex(
                    (assignment) =>
                        +assignment.tourInventoryTime.split(':')?.[0] >
                        currentTime
                );
                // only auto scroll when  autoRefresh is on
                if (closestAssignmentIndex >= 0 && autoRefresh) {
                    const targetElement = this.document.getElementById(
                        `assignment-${closestAssignmentIndex}`
                    );
                    if (targetElement) {
                        const offset = 350;
                        const bodyRect =
                            this.document.body.getBoundingClientRect().top;
                        const elementRect =
                            targetElement.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        const offsetPosition = elementPosition - offset;
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'instant',
                        });
                    }
                }
                this.isVisible = true;
            });

        // debounce and update the final changes in bulk
        this.pendingFinalChanges$
            .pipe(
                takeUntil(this.isDestroyed$),
                debounceTime(1000),
                map((res) => Object.values(res)),
                filter((res) => res.length > 0)
            )
            .subscribe((res) => {
                this.assignmentsState
                    .updateFinal(res)
                    .then(() => {
                        this.pendingFinalChanges$.next({});
                    })
                    .catch(() => {
                        // swallow error
                    });
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    updateFinal(assignment: AppAssignment, final: number): void {
        if (!assignment) {
            return;
        }
        this.pendingFinalChanges$.next({
            ...this.pendingFinalChanges$.getValue(),
            [assignment.tourInventoryId]: {
                dtdAssignmentGuideId: assignment.dtdAssignmentGuideId || 0,
                actualAdults:
                    assignment.actualAdults === 0
                        ? null
                        : assignment.actualAdults,
                actualChildren:
                    assignment.actualChildren === 0
                        ? null
                        : assignment.actualChildren,
                cruiseLineEscorts: assignment.cruiseLineEscorts || null,
                createdBy: '',
                specialNotes: assignment.specialNotes || '',
                payingAdditionalGuests:
                    assignment.payingAdditionalGuests || null,
                isClosed: assignment.isClosed,
                tourInventoryId: assignment.tourInventoryId,
                final,
                isFinalOnlyUpdate: true,
                equipmentNumber: assignment.equipmentNumber || 0,
            },
        });
    }

    toggleShowBooking(
        assignment: AppAssignment & {
            displayBookings: boolean;
            jointDepartureIndicatorColor: string | null;
        }
    ): void {
        this.assignmentsState.updateAssignmentState({
            ...assignment,
            displayBookings: !assignment.displayBookings,
        });
    }

    openAddOtcModal(assignment: AppAssignment): void {
        this.uiState.openAddOtcModal({
            ...assignment,
            tourDate: this.config$.getValue().dateSelected || new Date(),
        });
    }

    openAssignmentNotes(assignment: AppAssignment): void {
        if (!assignment) {
            return;
        }

        this.uiState.openAssignmentNotesModal({
            assignment,
            tourDate: this.config$.getValue().dateSelected || new Date(),
        });
    }

    openConfirmGuests(assignment: AppAssignment): void {
        if (!assignment) {
            return;
        }
        const dateSelected =
            this.assignmentsState.configs$.getValue().dateSelected ||
            new Date();
        this.uiState.openConfirmGuestsModal({
            assignment,
            tourDate: dateSelected,
        });
    }

    openUpdateStatusModal(assignment: AppAssignment): void {
        if (!assignment) {
            return;
        }
        const dateSelected =
            this.assignmentsState.configs$.getValue().dateSelected;
        this.uiState.openUpdateStatusModal(assignment, dateSelected);
    }

    openUpdateTransportationModal(assignment: AppAssignment): void {
        this.uiState.openUpdateTransportationModal({
            assignment,
            tourDate: this.config$.getValue().dateSelected || new Date(),
        });
    }

    openUpdatePrelimsModal(assignment: AppAssignment): void {
        this.uiState.openUpdatePrelimsModal({
            assignment,
            tourDate: this.config$.getValue().dateSelected || new Date(),
        });
    }

    openBookingListModal(assignment: AppAssignment): void {
        this.uiState.openBookingListModal({
            assignment,
            tourDate: this.config$.getValue().dateSelected || new Date(),
        });
    }

    openUpdateDepartureTimeModal(assignment: AppAssignment): void {
        this.uiState.openUpdateDepartureTimeModal({
            assignment,
            tourDate: this.config$.getValue().dateSelected || new Date(),
        });
    }

    openJoinDeparturesModal(assignment: AppAssignment): void {
        this.uiState.openJoinDeparturesModal({
            assignment,
            allAssignments: this.assignmentsState.assignments$.getValue(),
            tourDate: this.config$.getValue().dateSelected || new Date(),
        });
    }

    assignmentsTrackBy(
        _index: number,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item: any
    ): string {
        return `${item?.tourInventoryId}`;
    }
}
