import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AllocationReleaseTourSearch, TourInventoryItem } from '@app/core';
import { CalendarShip, CalendarTour } from '@app/shared';
import {
    AllocationAllocatedSearch,
    AllocationDeleteSearch,
    EditInventorySearch,
} from '../../../models';

interface ReleaseInventoryContext
    extends Omit<
        AllocationReleaseTourSearch,
        'companyId' | 'shipCompanyId' | 'tourId' | 'isBiWeekly' | 'days'
    > {
    shipCompanyId: number | null;
    tourId: number | null;
}
@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        addUnallocatedInventory: {
            isOpen: boolean;
        };
        allocateInventory: {
            isOpen: boolean;
            context?: AllocationAllocatedSearch;
        };
        deleteInventory: {
            isOpen: boolean;
            context?: AllocationDeleteSearch;
        };
        releaseInventory: {
            isOpen: boolean;
            context?: ReleaseInventoryContext;
        };
        editInventory: {
            isOpen: boolean;
            context?: EditInventorySearch;
        };
        deleteSelectedInventory: {
            isOpen: boolean;
            context?: CalendarTour;
        };
        releaseSelectedInventory: {
            isOpen: boolean;
            context?: CalendarTour;
        };
        allocateSelectedInventory: {
            isOpen: boolean;
            context?: {
                tour: CalendarTour;
                ships: CalendarShip[];
            };
        };
        editAllocatedSelectedInventory: {
            isOpen: boolean;
            context?: {
                tour: CalendarTour;
                ships: CalendarShip[];
            };
        };
        editUnallocatedSelectedInventory: {
            isOpen: boolean;
            context?: CalendarTour;
        };
        moveSelectedInventory: {
            isOpen: boolean;
            context?: {
                tour: CalendarTour;
                proposedDateTime: Date;
            };
        };

        quickDeleteSelectedInventory: {
            isOpen: boolean;
            context?: TourInventoryItem;
        };
        quickAllocateSelectedInventory: {
            isOpen: boolean;
            context?: TourInventoryItem;
        };
        quickReleaseSelectedInventory: {
            isOpen: boolean;
            context?: TourInventoryItem;
        };
        quickEditAllocatedSelectedInventory: {
            isOpen: boolean;
            context?: TourInventoryItem;
        };
        quickEditUnallocatedSelectedInventory: {
            isOpen: boolean;
            context?: TourInventoryItem;
        };
    }>({
        addUnallocatedInventory: {
            isOpen: false,
        },
        allocateInventory: {
            isOpen: false,
        },
        deleteInventory: {
            isOpen: false,
        },
        releaseInventory: {
            isOpen: false,
        },
        deleteSelectedInventory: {
            isOpen: false,
        },
        releaseSelectedInventory: {
            isOpen: false,
        },
        editInventory: {
            isOpen: false,
        },
        allocateSelectedInventory: {
            isOpen: false,
        },
        editAllocatedSelectedInventory: {
            isOpen: false,
        },
        editUnallocatedSelectedInventory: {
            isOpen: false,
        },
        moveSelectedInventory: {
            isOpen: false,
        },
        quickDeleteSelectedInventory: {
            isOpen: false,
        },
        quickAllocateSelectedInventory: {
            isOpen: false,
        },
        quickReleaseSelectedInventory: {
            isOpen: false,
        },
        quickEditAllocatedSelectedInventory: {
            isOpen: false,
        },
        quickEditUnallocatedSelectedInventory: {
            isOpen: false,
        },
    });

    openAddUnallocatedInventoryModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            addUnallocatedInventory: {
                isOpen: true,
            },
        });
    }

    closeAddUnallocatedInventoryModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            addUnallocatedInventory: {
                isOpen: false,
            },
        });
    }

    openAllocateInventoryModal(context: AllocationAllocatedSearch): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            allocateInventory: {
                isOpen: true,
                context,
            },
        });
    }

    closeAllocateInventoryModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            allocateInventory: {
                isOpen: false,
            },
        });
    }

    openDeleteInventoryModal(context: AllocationDeleteSearch): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            deleteInventory: {
                isOpen: true,
                context,
            },
        });
    }

    closeDeleteInventoryModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            deleteInventory: {
                isOpen: false,
            },
        });
    }

    openReleaseInventoryModal(context: ReleaseInventoryContext): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            releaseInventory: {
                isOpen: true,
                context,
            },
        });
    }

    closeReleaseInventoryModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            releaseInventory: {
                isOpen: false,
            },
        });
    }

    opeEditInventoryModal(context: EditInventorySearch): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            editInventory: {
                isOpen: true,
                context,
            },
        });
    }

    closeEditInventoryModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            editInventory: {
                isOpen: false,
            },
        });
    }

    openDeleteSelectedInventory(tour: CalendarTour): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            deleteSelectedInventory: {
                isOpen: true,
                context: tour,
            },
        });
    }

    closeDeleteSelectedInventory(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            deleteSelectedInventory: {
                isOpen: false,
            },
        });
    }

    openReleaseSelectedInventory(tour: CalendarTour): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            releaseSelectedInventory: {
                isOpen: true,
                context: tour,
            },
        });
    }

    closeReleaseSelectedInventory(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            releaseSelectedInventory: {
                isOpen: false,
            },
        });
    }

    openAllocateSelectedInventory(
        tour: CalendarTour,
        ships: CalendarShip[]
    ): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            allocateSelectedInventory: {
                isOpen: true,
                context: {
                    tour,
                    ships,
                },
            },
        });
    }

    closeAllocateSelectedInventory(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            allocateSelectedInventory: {
                isOpen: false,
            },
        });
    }

    openEditSelectedInventory(tour: CalendarTour, ships: CalendarShip[]): void {
        if (!tour.isReleased && tour.shipId === null) {
            this.modals$.next({
                ...this.modals$.getValue(),
                editAllocatedSelectedInventory: {
                    isOpen: false,
                },
                editUnallocatedSelectedInventory: {
                    isOpen: true,
                    context: tour,
                },
            });
        } else {
            this.modals$.next({
                ...this.modals$.getValue(),
                editUnallocatedSelectedInventory: {
                    isOpen: false,
                },
                editAllocatedSelectedInventory: {
                    isOpen: true,
                    context: {
                        tour,
                        ships,
                    },
                },
            });
        }
    }

    closeEditSelectedInventory(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            editAllocatedSelectedInventory: {
                isOpen: false,
            },
            editUnallocatedSelectedInventory: {
                isOpen: false,
            },
        });
    }

    openMoveSelectedInventory(context: {
        tour: CalendarTour;
        proposedDateTime: Date;
    }): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            moveSelectedInventory: {
                isOpen: true,
                context,
            },
        });
    }
    closeMoveSelectedInventory(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            moveSelectedInventory: {
                isOpen: false,
            },
        });
    }

    openQuickDeleteSelectedInventoryModal(context: TourInventoryItem): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            quickDeleteSelectedInventory: {
                isOpen: true,
                context,
            },
        });
    }

    closeQuickDeleteSelectedInventoryModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            quickDeleteSelectedInventory: {
                isOpen: false,
            },
        });
    }

    openQuickAllocateSelectedInventoryModal(context: TourInventoryItem): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            quickAllocateSelectedInventory: {
                isOpen: true,
                context,
            },
        });
    }

    closeQuickAllocateSelectedInventoryModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            quickAllocateSelectedInventory: {
                isOpen: false,
            },
        });
    }

    openQuickReleaseSelectedInventoryModal(context: TourInventoryItem): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            quickReleaseSelectedInventory: {
                isOpen: true,
                context,
            },
        });
    }

    closeQuickReleaseSelectedInventoryModal(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            quickReleaseSelectedInventory: {
                isOpen: false,
            },
        });
    }

    openQuickEditSelectedInventory(context: TourInventoryItem): void {
        if (!context.isReleased && context.shipId === null) {
            this.modals$.next({
                ...this.modals$.getValue(),
                quickEditAllocatedSelectedInventory: {
                    isOpen: false,
                },
                quickEditUnallocatedSelectedInventory: {
                    isOpen: true,
                    context,
                },
            });
        } else {
            this.modals$.next({
                ...this.modals$.getValue(),
                quickEditUnallocatedSelectedInventory: {
                    isOpen: false,
                },
                quickEditAllocatedSelectedInventory: {
                    isOpen: true,
                    context,
                },
            });
        }
    }

    closeQuickEditSelectedInventory(): void {
        this.modals$.next({
            ...this.modals$.getValue(),
            quickEditAllocatedSelectedInventory: {
                isOpen: false,
            },
            quickEditUnallocatedSelectedInventory: {
                isOpen: false,
            },
        });
    }
}
