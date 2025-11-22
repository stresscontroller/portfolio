import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { AssignmentsState, UIState } from '../../state';
import {
    AppAssignment,
    Features,
    OperatorFiltersState,
    UserState,
    checkPageFeatureAccess,
    isTouchDevice,
} from '@app/core';
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
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
    IconAddJointDepartureComponent,
    IconDepartedComponent,
    IconJointDepartureComponent,
    PermissionDirective,
    TourInventoryTimePipe,
} from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-dtd-table-condensed',
    templateUrl: './dtd-table-condensed.component.html',
    styleUrls: ['./dtd-table-condensed.component.scss'],
    imports: [
        CommonModule,
        ButtonModule,
        TableModule,
        MenuModule,
        IconDepartedComponent,
        IconJointDepartureComponent,
        IconAddJointDepartureComponent,
        TourInventoryTimePipe,
        PermissionDirective,
    ],
})
export class DtdTableCondensedComponent {
    assignmentsState = inject(AssignmentsState);
    operatorFiltersState = inject(OperatorFiltersState);
    uiState = inject(UIState);
    userState = inject(UserState);
    document = inject(DOCUMENT);
    features = Features;
    touchDevice = isTouchDevice();

    config$ = this.assignmentsState.configs$;
    assignments$ = combineLatest([
        this.assignmentsState.assignments$,
        this.operatorFiltersState.guides$,
        this.operatorFiltersState.equipmentList$,
    ]).pipe(
        map(([assignments, guides, equipments]) => {
            if (!assignments) {
                return [];
            }
            if (!guides && !equipments) {
                return assignments;
            }

            return assignments.map((assignment) => {
                return {
                    ...assignment,
                    specialNotes: assignment.specialNotes?.trim() || '',
                    adjustedDepartureTime: assignment.actualDepartureTime
                        ? new Date(assignment.actualDepartureTime)
                        : null,
                    guideFirstNameNickname:
                        guides && assignment.dtdAssignmentGuideId
                            ? guides.find(
                                  (guide) =>
                                      guide.guideId ===
                                      assignment.dtdAssignmentGuideId
                              )?.guideFirstNameNickname
                            : '',
                    transportationName:
                        equipments && assignment.dtdAssignmentTransportationId
                            ? equipments.find(
                                  (equipment) =>
                                      equipment.equipmentID ===
                                      assignment.dtdAssignmentTransportationId
                              )?.equipmentNumber
                            : '',
                };
            });
        })
    );

    private isDestroyed$ = new Subject<void>();
    isVisible = false;
    activeMenuAssignment$ = new BehaviorSubject<
        (AppAssignment & { adjustedDepartureTime?: Date }) | undefined
    >(undefined);
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
                    ...(checkPageFeatureAccess(
                        featureControls,
                        Features.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch
                            .features.preLimUpdate.name
                    ) && activeMenuAssignment.shipName !== 'Book Direct'
                        ? [
                              {
                                  label: 'Update Prelims',
                                  icon: 'pi pi-list-check',
                                  command: () => {
                                      if (activeMenuAssignment) {
                                          this.uiState.openUpdatePrelimsModal({
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
                    ...(checkPageFeatureAccess(
                        featureControls,
                        Features.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch.name,
                        Features.dailyTourDispatch.pages.dailyTourDispatch
                            .features.departureTimeUpdate.name
                    ) && activeMenuAssignment.adjustedDepartureTime
                        ? [
                              {
                                  label: 'Update Departure Time',
                                  icon: 'pi pi-clock',
                                  command: () => {
                                      if (activeMenuAssignment) {
                                          this.uiState.openUpdateDepartureTimeModal(
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
                            .features.addJointDeparture.name
                    )
                        ? [
                              {
                                  label: 'Move to Alternate Time',
                                  customIcon: 'joint-departure',
                                  command: () => {
                                      if (activeMenuAssignment) {
                                          this.uiState.openJoinDeparturesModal({
                                              assignment: activeMenuAssignment,
                                              tourDate:
                                                  this.config$.getValue()
                                                      .dateSelected ||
                                                  new Date(),
                                              allAssignments:
                                                  this.assignmentsState.assignments$.getValue(),
                                          });
                                      }
                                  },
                              },
                          ]
                        : []),
                ];
            })
        );

    ngOnInit(): void {
        this.assignmentsState.status$
            .pipe(
                map((status) => status.loadAssignments),
                takeUntil(this.isDestroyed$),
                distinctUntilChanged(),
                tap((status) => {
                    if (status === 'loading') {
                        // prevent the table from flickering when scrolling
                        this.isVisible = false;
                    }
                }),
                filter((status) => status !== 'loading'),
                switchMap(() => {
                    return this.assignments$.pipe(
                        takeUntil(this.isDestroyed$),
                        // filter((assignments) => assignments.length > 0),
                        distinctUntilChanged(
                            (prev, curr) =>
                                JSON.stringify(prev) === JSON.stringify(curr)
                        ),
                        debounceTime(100)
                    );
                })
            )
            .subscribe((assignments) => {
                const currentTime = new Date().getHours() - 1;
                const closestAssignmentIndex = assignments.findIndex(
                    (assignment) =>
                        +assignment.tourInventoryTime.split(':')?.[0] >
                        currentTime
                );
                if (closestAssignmentIndex >= 0) {
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
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }
}
