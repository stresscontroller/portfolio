import { Injectable, inject } from '@angular/core';
import {
    AgentUser,
    AppGuide,
    AppPickupLocation,
    Docks,
    FiltersApiService,
    InventoryManagementApiService,
    UserManagementApiService,
    Port,
    Ship,
    ShipCompany,
    ShipDataInfo,
    Tour,
    UserState,
    UserCertificationsData,
    UserRoles,
    ApiEquipmentItem,
    UserEvaluationsApiService,
    Qualification,
    Agent,
    AgentApiService,
    AuthRole,
    CancellationReason,
    ApiAgentModifyBookingService,
} from '@app/core';
import { BehaviorSubject, filter, lastValueFrom, map, take, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OperatorFiltersState {
    filtersApiService = inject(FiltersApiService);
    agentApiService = inject(AgentApiService);
    inventoryManagementApiService = inject(InventoryManagementApiService);
    userManagementApiService = inject(UserManagementApiService);
    userEvaluationsApiService = inject(UserEvaluationsApiService);
    agentModifyBookingApiService = inject(ApiAgentModifyBookingService);
    userState = inject(UserState);

    inventoryManagementInventoryType$ = new BehaviorSubject<
        { id: string; label: string }[]
    >([
        { id: 'ALL', label: 'All' },
        {
            id: 'A',
            label: 'Allocated',
        },
        {
            id: 'UA',
            label: 'Unallocated',
        },
        {
            id: 'R',
            label: 'Released',
        },
    ]);
    cruiseLines$ = new BehaviorSubject<ShipCompany[]>([]);
    cruiseLinesMap$ = this.cruiseLines$.pipe(
        map((cruiseLines) => {
            return cruiseLines.reduce<Record<number, ShipCompany>>(
                (acc, curr) => {
                    acc[curr.shipCompanyId] = curr;
                    return acc;
                },
                {}
            );
        })
    );
    cruiseShips$ = new BehaviorSubject<Record<number, Ship[]>>({});
    pickupLocationsNotArrivingByShip$ = new BehaviorSubject<
        Record<number, AppPickupLocation[]>
    >({});
    pickupLocationsArrivingByShip$ = new BehaviorSubject<
        Record<number, AppPickupLocation[]>
    >({});
    guides$ = new BehaviorSubject<AppGuide[]>([]);
    equipmentList$ = new BehaviorSubject<ApiEquipmentItem[]>([]);
    docks$ = new BehaviorSubject<Docks[]>([]);
    ports$ = new BehaviorSubject<Port[]>([]);
    userRoles$ = new BehaviorSubject<UserRoles[]>([]);
    authRoles$ = new BehaviorSubject<AuthRole[]>([]);
    userCertifications$ = new BehaviorSubject<UserCertificationsData[]>([]);

    associatedAgents$ = new BehaviorSubject<Agent[]>([]);

    portsWithAll$ = this.ports$.pipe(
        map((ports) =>
            ports
                ? [
                      {
                          portId: 0,
                          portName: 'All Ports',
                          companyUniqueID: '',
                          isActive: true,
                          createDate: null,
                          createBy: null,
                          lastModifiedDate: null,
                          lastModifiedBy: null,
                          mapFileName: null,
                          mapFilePath: null,
                          country: null,
                          isDefault: true,
                          region: '',
                      },
                      ...ports,
                  ]
                : []
        )
    );
    tours$ = new BehaviorSubject<Tour[]>([]);
    shipData$ = new BehaviorSubject<ShipDataInfo[]>([]);
    agentUsers$ = new BehaviorSubject<AgentUser[]>([]);
    qualifications$ = new BehaviorSubject<Qualification[]>([]);
    evaluations$ = new BehaviorSubject<
        { displayName: string; value: string }[]
    >([
        { displayName: 'Evaluation', value: 'Evaluation' },
        { displayName: 'Coaching', value: 'Coaching' },
    ]);
    tourInventoryCancellationReason$ = new BehaviorSubject<
        CancellationReason[]
    >([]);

    isLoading$ = new BehaviorSubject<{
        cruiseLines: boolean;
        cruiseShips: boolean;
        guides: boolean;
        docks: boolean;
        ports: boolean;
        tours: boolean;
        agentUsers: boolean;
        pickupLocations: boolean;
        userCertifications: boolean;
        userRoles: boolean;
        equipmentList: boolean;
        qualifications: boolean;
        associatedAgents: boolean;
        tourInventoryCancellationReason: boolean;
    }>({
        cruiseLines: false,
        cruiseShips: false,
        guides: false,
        docks: false,
        ports: false,
        tours: false,
        agentUsers: false,
        pickupLocations: false,
        userCertifications: false,
        userRoles: false,
        equipmentList: false,
        qualifications: false,
        associatedAgents: false,
        tourInventoryCancellationReason: false,
    });

    getGuides(): Promise<AppGuide[]> {
        const guides = this.guides$.getValue();
        if (guides.length > 0) {
            return Promise.resolve(guides);
        }
        const companyUniqueId =
            this.userState.aspNetUser$.getValue()?.companyUniqueID;
        if (!companyUniqueId) {
            // TODO: throw error
            return Promise.resolve([]);
        }
        if (this.isLoading$.getValue().guides === true) {
            return lastValueFrom(this.guides$.pipe(take(1)));
        }
        this.updateIsLoading('guides', true);
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    // TODO: throw error
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.filtersApiService.getGuides(user.companyUniqueID).pipe(
                        map((res) => {
                            const data = res.data || [];
                            return data.sort((a, b) =>
                                a.guideFirstNameNickname.localeCompare(
                                    b.guideFirstNameNickname
                                )
                            );
                        }),
                        tap((data) => {
                            this.guides$.next(data);
                        })
                    )
                );
            })
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('guides', false);
            });
    }

    getEquipmentList(): Promise<ApiEquipmentItem[]> {
        const equipmentList = this.equipmentList$.getValue();
        if (equipmentList.length > 0) {
            return Promise.resolve(equipmentList);
        }
        if (this.isLoading$.getValue().equipmentList === true) {
            return lastValueFrom(this.equipmentList$.pipe(take(1)));
        }
        this.updateIsLoading('equipmentList', true);
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    throw new Error('Company Unique ID not found');
                }
                return lastValueFrom(
                    this.filtersApiService
                        .getEquipmentList(user.companyUniqueID)
                        .pipe(
                            map((res) => {
                                const data = res.data || [];
                                return data.sort((a, b) =>
                                    a.equipmentNumber.localeCompare(
                                        b.equipmentNumber
                                    )
                                );
                            }),
                            tap((data) => {
                                this.equipmentList$.next(data);
                            })
                        )
                );
            })
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('guides', false);
            });
    }

    getCruiseLines(): Promise<ShipCompany[]> {
        const cruiseLines = this.cruiseLines$.getValue();
        if (cruiseLines.length > 0) {
            return Promise.resolve(cruiseLines);
        }
        if (this.isLoading$.getValue().cruiseLines === true) {
            return lastValueFrom(this.cruiseLines$.pipe(take(1)));
        }
        this.updateIsLoading('cruiseLines', true);
        return lastValueFrom(
            this.filtersApiService.getShipCompanyList(false).pipe(
                map(
                    (res) =>
                        [
                            {
                                shipCompanyId: 0,
                                shipCompanyName: 'Book Direct',
                                shipCompanyColor: '#053654',
                                shipCompanyBackgroundColor: '#05365420',
                                dataSource: 'local',
                            },
                            ...res.data,
                        ] || []
                ),
                tap((data) => {
                    this.cruiseLines$.next(data);
                })
            )
        )
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('cruiseLines', false);
            });
    }

    getShipList(shipCompanyId: number): Promise<Ship[]> {
        const cruiseShips = this.cruiseShips$.getValue();
        if (cruiseShips[shipCompanyId]?.length > 0) {
            return Promise.resolve(cruiseShips[shipCompanyId]);
        }
        this.updateIsLoading('cruiseShips', true);
        return lastValueFrom(
            this.filtersApiService.getShipListByCompany(shipCompanyId).pipe(
                map((res) => res.data || []),
                tap((data) => {
                    this.cruiseShips$.next({
                        ...cruiseShips,
                        [shipCompanyId]: data,
                    });
                })
            )
        )
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('cruiseShips', false);
            });
    }

    getDocks(): Promise<Docks[]> {
        const docks = this.docks$.getValue();
        if (docks.length > 0) {
            return Promise.resolve(docks);
        }
        if (this.isLoading$.getValue().docks === true) {
            return lastValueFrom(this.docks$.pipe(take(1)));
        }
        this.updateIsLoading('docks', true);
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    // TODO: throw error
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.filtersApiService.getDocks(user.companyUniqueID).pipe(
                        map((res) => {
                            const data = res.data || [];
                            return data.sort((a, b) =>
                                a.dockName.localeCompare(b.dockName)
                            );
                        }),
                        tap((data) => {
                            this.docks$.next(data);
                        })
                    )
                );
            })
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('docks', false);
            });
    }

    getTours(): Promise<Tour[]> {
        const tours = this.tours$.getValue();
        if (tours.length > 0) {
            return Promise.resolve(tours);
        }
        if (this.isLoading$.getValue().tours === true) {
            return lastValueFrom(
                this.tours$.pipe(
                    filter((t) => t.length > 0),
                    take(1)
                )
            );
        }
        this.updateIsLoading('tours', true);
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    // TODO: throw error
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.filtersApiService.getTours(user.companyUniqueID).pipe(
                        map((res) => {
                            const data = res.data || [];
                            return data.sort((a, b) =>
                                a.tourName.localeCompare(b.tourName)
                            );
                        }),
                        tap((data) => {
                            this.tours$.next(data);
                        })
                    )
                );
            })
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('tours', false);
            });
    }

    getPorts(): Promise<Port[]> {
        const ports = this.ports$.getValue();
        if (ports.length > 0) {
            return Promise.resolve(ports);
        }
        if (this.isLoading$.getValue().ports === true) {
            return lastValueFrom(
                this.ports$.pipe(
                    filter((ports) => ports?.length > 0),
                    take(1)
                )
            );
        }
        this.updateIsLoading('ports', true);
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    // TODO: throw error
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.filtersApiService.getPorts(user.companyUniqueID).pipe(
                        map((res) => {
                            const data = res.data || [];
                            return data.sort((a, b) =>
                                a.portName.localeCompare(b.portName)
                            );
                        }),
                        tap((data) => {
                            this.ports$.next(data);
                        })
                    )
                );
            })
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('ports', false);
            });
    }

    getUserRoles(reload?: boolean): Promise<UserRoles[]> {
        const userRoles = this.userRoles$.getValue();
        if (!reload && userRoles.length > 0) {
            return Promise.resolve(userRoles);
        }
        if (this.isLoading$.getValue().userRoles === true) {
            return lastValueFrom(this.userRoles$.pipe(take(1)));
        }
        this.updateIsLoading('userRoles', true);
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.userManagementApiService
                        .getUserRoleList(user.companyUniqueID)
                        .pipe(
                            map(
                                (res) =>
                                    res.data
                                        ?.map((role) => {
                                            return {
                                                ...role,
                                                id: role.id.toLowerCase(),
                                            };
                                        })
                                        .sort((a, b) =>
                                            a.name.localeCompare(b.name)
                                        ) || []
                            ),
                            tap((data) => {
                                this.userRoles$.next(data);
                            })
                        )
                );
            })
            .catch(() => {
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('userRoles', false);
            });
    }

    getPickupLocation(
        tourInventoryId: number,
        isArrivingByCruise: boolean
    ): Promise<AppPickupLocation[]> {
        if (isArrivingByCruise) {
            const pickupLocationsArrivingByShip =
                this.pickupLocationsArrivingByShip$.getValue();
            if (tourInventoryId in pickupLocationsArrivingByShip) {
                return Promise.resolve(
                    pickupLocationsArrivingByShip[tourInventoryId]
                );
            }
        } else {
            const pickupLocationsNotArrivingByShip =
                this.pickupLocationsNotArrivingByShip$.getValue();
            if (tourInventoryId in pickupLocationsNotArrivingByShip) {
                return Promise.resolve(
                    pickupLocationsNotArrivingByShip[tourInventoryId]
                );
            }
        }
        this.updateIsLoading('pickupLocations', true);
        return lastValueFrom(
            this.filtersApiService
                .getPickupLocations(tourInventoryId, isArrivingByCruise)
                .pipe(
                    map((res) => res.data || []),
                    tap((data) => {
                        if (isArrivingByCruise) {
                            this.pickupLocationsArrivingByShip$.next({
                                ...this.pickupLocationsArrivingByShip$.getValue(),
                                [tourInventoryId]: data,
                            });
                        } else {
                            this.pickupLocationsNotArrivingByShip$.next({
                                ...this.pickupLocationsNotArrivingByShip$.getValue(),
                                [tourInventoryId]: data,
                            });
                        }
                    })
                )
        )
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('pickupLocations', false);
            });
    }

    getAgentUsers(): Promise<AgentUser[]> {
        const agentUsers = this.agentUsers$.getValue();
        if (agentUsers.length > 0) {
            return Promise.resolve(agentUsers);
        }
        if (this.isLoading$.getValue().agentUsers === true) {
            return lastValueFrom(this.agentUsers$.pipe(take(1)));
        }
        this.updateIsLoading('agentUsers', true);
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    // TODO: throw error
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.filtersApiService
                        .getAgentUsers(user.companyUniqueID)
                        .pipe(
                            map(
                                (res) =>
                                    res.data?.filter(
                                        (agent) => agent.allowInvoice === true
                                    ) || []
                            ),
                            map((data) =>
                                data.sort((a, b) =>
                                    a.partnerName.localeCompare(b.partnerName)
                                )
                            ),
                            tap((data) => {
                                this.agentUsers$.next(data);
                            })
                        )
                );
            })
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('agentUsers', false);
            });
    }

    getAssociatedAgents(): Promise<Agent[]> {
        const associatedAgents = this.associatedAgents$.getValue();
        if (associatedAgents.length > 0) {
            return Promise.resolve(associatedAgents);
        }
        if (this.isLoading$.getValue().associatedAgents === true) {
            return lastValueFrom(this.associatedAgents$.pipe(take(1)));
        }
        this.updateIsLoading('associatedAgents', true);
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    // TODO: throw error
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.agentApiService
                        .getAssociatedAgents(user.companyUniqueID, true)
                        .pipe(
                            map((res) => res.data),
                            tap((data) => {
                                this.associatedAgents$.next(data);
                            })
                        )
                );
            })
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('associatedAgents', false);
            });
    }

    getShipData() {
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    // TODO: throw error
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.inventoryManagementApiService
                        .getShipData(user.companyUniqueID)
                        .pipe(
                            map((res) => res.data || []),
                            tap((data) => {
                                this.shipData$.next(data);
                            })
                        )
                );
            })
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('shipData', false);
            });
    }

    loadUserQualificationData() {
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID || !user.id) {
                    // TODO: throw error
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.userManagementApiService
                        .loadUserQualificationData(
                            user.companyUniqueID,
                            user.id
                        )
                        .pipe(
                            map((res) => res.data || []),
                            tap((data) => {
                                this.userCertifications$.next(data);
                            })
                        )
                );
            })
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('userCertifications', false);
            });
    }

    loadQualificationData(): Promise<Qualification[]> {
        return this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID) {
                    return Promise.resolve([]);
                }
                return lastValueFrom(
                    this.userEvaluationsApiService
                        .loadQualificationData(user.companyUniqueID)
                        .pipe(
                            map((res) => res.data || []),
                            tap((data) => {
                                this.qualifications$.next(data);
                            })
                        )
                );
            })
            .catch(() => {
                // TODO: error handling required - for now, assume it returns an empty array
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('qualifications', false);
            });
    }

    getTourInventoryCancellationReason(): Promise<CancellationReason[]> {
        const tourInventoryCancellationReason =
            this.tourInventoryCancellationReason$.getValue();
        if (tourInventoryCancellationReason.length > 0) {
            return Promise.resolve(tourInventoryCancellationReason);
        }
        if (
            this.isLoading$.getValue().tourInventoryCancellationReason === true
        ) {
            return lastValueFrom(
                this.tourInventoryCancellationReason$.pipe(take(1))
            );
        }
        this.updateIsLoading('tourInventoryCancellationReason', true);
        return lastValueFrom(
            this.agentModifyBookingApiService.getCancellationReasonList().pipe(
                map((res) => res.data),
                tap((data) => {
                    this.tourInventoryCancellationReason$.next(data);
                })
            )
        )
            .catch(() => {
                return Promise.resolve([]);
            })
            .finally(() => {
                this.updateIsLoading('tourInventoryCancellationReason', false);
            });
    }

    private updateIsLoading(
        key:
            | 'cruiseLines'
            | 'cruiseShips'
            | 'guides'
            | 'docks'
            | 'ports'
            | 'tours'
            | 'agentUsers'
            | 'shipData'
            | 'pickupLocations'
            | 'userCertifications'
            | 'userRoles'
            | 'equipmentList'
            | 'qualifications'
            | 'associatedAgents'
            | 'tourInventoryCancellationReason',
        isLoading: boolean
    ): void {
        this.isLoading$.next({
            ...this.isLoading$.getValue(),
            [key]: isLoading,
        });
    }
}
