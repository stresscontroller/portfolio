import { Injectable, inject } from '@angular/core';
import {
    InventoryManagementApiService,
    UserState,
    FileHeaderTextMapsItem,
    ShipCompanyShipMapsItem,
    PortMapsItem,
    TourMapsItem,
    FilesMapApiService,
    UploadFileItem,
    OperatorFiltersState,
    UIState as CoreUIState,
    ErrorDialogMessages,
    UIStatus,
} from '@app/core';
import {
    BehaviorSubject,
    catchError,
    distinctUntilChanged,
    filter,
    lastValueFrom,
    of,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs';
import { UIState } from './ui.state';

@Injectable()
export class SalesReportState {
    inventoryManagementApiService = inject(InventoryManagementApiService);
    filesMapApiService = inject(FilesMapApiService);
    operatorFiltersState = inject(OperatorFiltersState);
    userState = inject(UserState);
    uiState = inject(UIState);
    coreUIState = inject(CoreUIState);

    shipCompanyConfig$ = new BehaviorSubject<number | undefined>(-1);

    reportFileStatus$ = new BehaviorSubject<{
        fileHeaderReportStatus: UIStatus;
        shipReportStatus: UIStatus;
        tourReportStatus: UIStatus;
        portReportStatus: UIStatus;
        fileUploadStatus: UIStatus;
        fileUploadErrorMessages: string[];
    }>({
        fileHeaderReportStatus: 'idle',
        shipReportStatus: 'idle',
        tourReportStatus: 'idle',
        portReportStatus: 'idle',
        fileUploadStatus: 'idle',
        fileUploadErrorMessages: [],
    });

    reportingTableData$ = new BehaviorSubject<{
        fileHeaders: FileHeaderTextMapsItem[];
        shipReports: ShipCompanyShipMapsItem[];
        tourReports: TourMapsItem[];
        portReports: PortMapsItem[];
    }>({
        fileHeaders: [],
        shipReports: [],
        tourReports: [],
        portReports: [],
    });

    private initialized = false;
    private refreshTriggered$ = new BehaviorSubject<number>(0);

    init(): void {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.initReports();
    }

    resetFileUploadStatus(): void {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.getValue(),
            fileUploadStatus: 'idle',
            fileUploadErrorMessages: [],
        });
    }

    refresh(): void {
        this.refreshTriggered$.next(new Date().getTime());
    }

    initReports(): void {
        this.operatorFiltersState.getCruiseLines().then(() => {
            this.shipCompanyConfig$
                .pipe(
                    distinctUntilChanged(),
                    filter(
                        (shipCompanyId) =>
                            shipCompanyId !== undefined &&
                            shipCompanyId !== null
                    ),
                    switchMap((shipCompanyId) =>
                        this.refreshTriggered$.pipe(
                            tap(() => {
                                this.loadFileHeaderReports(shipCompanyId ?? 0);
                                this.loadShipReports(shipCompanyId ?? 0);
                                this.loadTourReports(shipCompanyId ?? 0);
                                this.loadPortReports(shipCompanyId ?? 0);
                            })
                        )
                    )
                )
                .subscribe();
        });
    }

    updateSelectCruiseLineConfig(shipCompanyId: number): void {
        this.shipCompanyConfig$.next(shipCompanyId);
        this.refresh();
    }

    loadFileHeaderReports(
        shipCompanyId: number
    ): Promise<FileHeaderTextMapsItem[]> {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            fileHeaderReportStatus: 'loading',
        });

        return lastValueFrom(
            this.filesMapApiService
                .getShipCompanyFileHeaderTextMapsByShipCompanyId(shipCompanyId)
                .pipe(
                    withLatestFrom(this.operatorFiltersState.cruiseLinesMap$),
                    tap(([res, cruiseLines]) => {
                        this.reportingTableData$.next({
                            ...this.reportingTableData$.value,
                            fileHeaders: (res.data || res)?.map((data) => {
                                return {
                                    ...data,
                                    shipCompanyName:
                                        cruiseLines[data.shipCompanyId]
                                            ?.shipCompanyName,
                                };
                            }),
                        });
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.value,
                            fileHeaderReportStatus: 'success',
                        });
                    }),
                    catchError((error) => {
                        this.coreUIState.openErrorDialog({
                            title: error?.errorTitle
                                ? error.errorTitle
                                : ErrorDialogMessages.inventoryManagement
                                      .fileHeaderReportLoadError.title,
                            description:
                                error?.errors &&
                                Array.isArray(error.errors) &&
                                error.errors.length > 0
                                    ? error.errors[0]
                                    : ErrorDialogMessages.inventoryManagement
                                          .fileHeaderReportLoadError
                                          .description,
                            buttons: [
                                {
                                    text: ErrorDialogMessages
                                        .inventoryManagement
                                        .fileHeaderReportLoadError.buttons
                                        .close,
                                    isPrimary: true,
                                    onClick: () => {
                                        // do nothing
                                    },
                                },
                            ],
                        });
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            fileHeaderReportStatus: 'error',
                        });
                        return of(error);
                    })
                )
        );
    }

    loadShipReports(shipCompanyId: number): Promise<ShipCompanyShipMapsItem[]> {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            shipReportStatus: 'loading',
        });
        return lastValueFrom(
            this.filesMapApiService
                .getShipCompanyShipMapsByShipCompanyId(shipCompanyId)
                .pipe(
                    withLatestFrom(this.operatorFiltersState.cruiseLinesMap$),
                    tap(([res, cruiseLines]) => {
                        this.reportingTableData$.next({
                            ...this.reportingTableData$.value,
                            shipReports: (res.data || res)?.map((data) => {
                                return {
                                    ...data,
                                    shipCompanyName:
                                        cruiseLines[data.shipCompanyId]
                                            ?.shipCompanyName,
                                };
                            }),
                        });
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.value,
                            shipReportStatus: 'success',
                        });
                    }),
                    catchError((error) => {
                        this.coreUIState.openErrorDialog({
                            title: error?.errorTitle
                                ? error.errorTitle
                                : ErrorDialogMessages.inventoryManagement
                                      .shipReportLoadError.title,
                            description:
                                error?.errors &&
                                Array.isArray(error.errors) &&
                                error.errors.length > 0
                                    ? error.errors[0]
                                    : ErrorDialogMessages.inventoryManagement
                                          .shipReportLoadError.description,
                            buttons: [
                                {
                                    text: ErrorDialogMessages
                                        .inventoryManagement.shipReportLoadError
                                        .buttons.close,
                                    isPrimary: true,
                                    onClick: () => {
                                        // do nothing
                                    },
                                },
                            ],
                        });
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            shipReportStatus: 'error',
                        });
                        return of(error);
                    })
                )
        );
    }

    loadTourReports(shipCompanyId: number): Promise<TourMapsItem[]> {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            tourReportStatus: 'loading',
        });

        return lastValueFrom(
            this.filesMapApiService
                .getShipCompanyTourMapsByShipCompanyId(shipCompanyId)
                .pipe(
                    withLatestFrom(this.operatorFiltersState.cruiseLinesMap$),

                    tap(([res, cruiseLines]) => {
                        this.reportingTableData$.next({
                            ...this.reportingTableData$.value,
                            tourReports: (res.data || res)?.map((data) => {
                                return {
                                    ...data,
                                    shipCompanyName:
                                        cruiseLines[data.shipCompanyId]
                                            ?.shipCompanyName,
                                };
                            }),
                        });
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.value,
                            tourReportStatus: 'success',
                        });
                    }),
                    catchError((error) => {
                        this.coreUIState.openErrorDialog({
                            title: error?.errorTitle
                                ? error.errorTitle
                                : ErrorDialogMessages.inventoryManagement
                                      .tourReportLoadError.title,
                            description:
                                error?.errors &&
                                Array.isArray(error.errors) &&
                                error.errors.length > 0
                                    ? error.errors[0]
                                    : ErrorDialogMessages.inventoryManagement
                                          .tourReportLoadError.description,
                            buttons: [
                                {
                                    text: ErrorDialogMessages
                                        .inventoryManagement.tourReportLoadError
                                        .buttons.close,
                                    isPrimary: true,
                                    onClick: () => {
                                        // do nothing
                                    },
                                },
                            ],
                        });
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            tourReportStatus: 'error',
                        });
                        return of(error);
                    })
                )
        );
    }

    loadPortReports(shipCompanyId: number): Promise<PortMapsItem[]> {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            portReportStatus: 'loading',
        });

        return lastValueFrom(
            this.filesMapApiService
                .getShipCompanyPortMapsByShipCompanyId(shipCompanyId)
                .pipe(
                    withLatestFrom(this.operatorFiltersState.cruiseLinesMap$),
                    tap(([res, cruiseLines]) => {
                        this.reportingTableData$.next({
                            ...this.reportingTableData$.value,
                            portReports: (res.data || res)?.map((data) => {
                                return {
                                    ...data,
                                    shipCompanyName:
                                        cruiseLines[data.shipCompanyId]
                                            ?.shipCompanyName,
                                };
                            }),
                        });
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.value,
                            portReportStatus: 'success',
                        });
                    }),
                    catchError((error) => {
                        this.coreUIState.openErrorDialog({
                            title: error?.errorTitle
                                ? error.errorTitle
                                : ErrorDialogMessages.inventoryManagement
                                      .portReportLoadError.title,
                            description:
                                error?.errors &&
                                Array.isArray(error.errors) &&
                                error.errors.length > 0
                                    ? error.errors[0]
                                    : ErrorDialogMessages.inventoryManagement
                                          .portReportLoadError.description,
                            buttons: [
                                {
                                    text: ErrorDialogMessages
                                        .inventoryManagement.portReportLoadError
                                        .buttons.close,
                                    isPrimary: true,
                                    onClick: () => {
                                        // do nothing
                                    },
                                },
                            ],
                        });
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            portReportStatus: 'error',
                        });
                        return of(error);
                    })
                )
        );
    }

    updateInsertShipCompanyFileHeaderTextMap(config: FileHeaderTextMapsItem) {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            fileHeaderReportStatus: 'loading',
        });
        return lastValueFrom(
            this.filesMapApiService
                .updateInsertShipCompanyFileHeaderTextMap(config)
                .pipe(
                    tap((res) => {
                        if (res.success) {
                            this.reportFileStatus$.next({
                                ...this.reportFileStatus$.getValue(),
                                fileHeaderReportStatus: 'success',
                            });
                        } else {
                            throw res.error;
                        }
                    }),
                    catchError((error) => {
                        this.coreUIState.openErrorDialog({
                            title: error?.errorTitle
                                ? error.errorTitle
                                : ErrorDialogMessages.inventoryManagement
                                      .fileHeaderReportEditError.title,
                            description:
                                error?.errors &&
                                Array.isArray(error.errors) &&
                                error.errors.length > 0
                                    ? error.errors[0]
                                    : ErrorDialogMessages.inventoryManagement
                                          .fileHeaderReportEditError
                                          .description,
                            buttons: [
                                {
                                    text: ErrorDialogMessages
                                        .inventoryManagement
                                        .fileHeaderReportEditError.buttons
                                        .close,
                                    isPrimary: true,
                                    onClick: () => {
                                        // do nothing
                                    },
                                },
                            ],
                        });
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            fileHeaderReportStatus: 'error',
                        });
                        return of(error);
                    })
                )
        );
    }

    deleteShipCompanyFileHeaderTextMap(shipCompanyId: number) {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            fileHeaderReportStatus: 'loading',
        });
        return lastValueFrom(
            this.filesMapApiService
                .deleteShipCompanyFileHeaderTextMap(shipCompanyId)
                .pipe(
                    tap((res) => {
                        if (res.success) {
                            this.reportFileStatus$.next({
                                ...this.reportFileStatus$.getValue(),
                                fileHeaderReportStatus: 'success',
                            });
                        } else {
                            throw res.error;
                        }
                    }),
                    catchError((error) => {
                        this.coreUIState.openErrorDialog({
                            title: error?.errorTitle
                                ? error.errorTitle
                                : ErrorDialogMessages.inventoryManagement
                                      .fileHeaderReportDeleteError.title,
                            description:
                                error?.errors &&
                                Array.isArray(error.errors) &&
                                error.errors.length > 0
                                    ? error.errors[0]
                                    : ErrorDialogMessages.inventoryManagement
                                          .fileHeaderReportDeleteError
                                          .description,
                            buttons: [
                                {
                                    text: ErrorDialogMessages
                                        .inventoryManagement
                                        .fileHeaderReportDeleteError.buttons
                                        .close,
                                    isPrimary: true,
                                    onClick: () => {
                                        // do nothing
                                    },
                                },
                            ],
                        });
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            fileHeaderReportStatus: 'error',
                        });
                        return of(error);
                    })
                )
        );
    }

    updateInsertShipCompanyShipMap(config: ShipCompanyShipMapsItem) {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            shipReportStatus: 'loading',
        });
        return lastValueFrom(
            this.filesMapApiService.updateInsertShipCompanyShipMap(config).pipe(
                tap((res) => {
                    if (res.success) {
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            shipReportStatus: 'success',
                        });
                    } else {
                        throw res.error;
                    }
                }),
                catchError((error) => {
                    this.coreUIState.openErrorDialog({
                        title: error?.errorTitle
                            ? error.errorTitle
                            : ErrorDialogMessages.inventoryManagement
                                  .shipReportEditError.title,
                        description:
                            error?.errors &&
                            Array.isArray(error.errors) &&
                            error.errors.length > 0
                                ? error.errors[0]
                                : ErrorDialogMessages.inventoryManagement
                                      .shipReportEditError.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.inventoryManagement
                                    .shipReportEditError.buttons.close,
                                isPrimary: true,
                                onClick: () => {
                                    // do nothing
                                },
                            },
                        ],
                    });
                    this.reportFileStatus$.next({
                        ...this.reportFileStatus$.getValue(),
                        shipReportStatus: 'error',
                    });
                    return of(error);
                })
            )
        );
    }

    deleteShipCompanyShipMap(config: ShipCompanyShipMapsItem) {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            shipReportStatus: 'loading',
        });
        return lastValueFrom(
            this.filesMapApiService.deleteShipCompanyShipMap(config).pipe(
                tap((res) => {
                    if (res.success) {
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            shipReportStatus: 'success',
                        });
                    } else {
                        throw res.error;
                    }
                }),
                catchError((error) => {
                    this.coreUIState.openErrorDialog({
                        title: error?.errorTitle
                            ? error.errorTitle
                            : ErrorDialogMessages.inventoryManagement
                                  .shipReportDeleteError.title,
                        description:
                            error?.errors &&
                            Array.isArray(error.errors) &&
                            error.errors.length > 0
                                ? error.errors[0]
                                : ErrorDialogMessages.inventoryManagement
                                      .shipReportDeleteError.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.inventoryManagement
                                    .shipReportDeleteError.buttons.close,
                                isPrimary: true,
                                onClick: () => {
                                    // do nothing
                                },
                            },
                        ],
                    });
                    this.reportFileStatus$.next({
                        ...this.reportFileStatus$.getValue(),
                        shipReportStatus: 'error',
                    });
                    return of(error);
                })
            )
        );
    }

    updateInsertShipCompanyPortMap(config: PortMapsItem) {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            portReportStatus: 'loading',
        });
        return lastValueFrom(
            this.filesMapApiService.updateInsertShipCompanyPortMap(config).pipe(
                tap((res) => {
                    if (res.success) {
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            portReportStatus: 'success',
                        });
                    } else {
                        throw res.error;
                    }
                }),
                catchError((error) => {
                    this.coreUIState.openErrorDialog({
                        title: error?.errorTitle
                            ? error.errorTitle
                            : ErrorDialogMessages.inventoryManagement
                                  .portReportEditError.title,
                        description:
                            error?.errors &&
                            Array.isArray(error.errors) &&
                            error.errors.length > 0
                                ? error.errors[0]
                                : ErrorDialogMessages.inventoryManagement
                                      .portReportEditError.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.inventoryManagement
                                    .portReportEditError.buttons.close,
                                isPrimary: true,
                                onClick: () => {
                                    // do nothing
                                },
                            },
                        ],
                    });
                    this.reportFileStatus$.next({
                        ...this.reportFileStatus$.getValue(),
                        portReportStatus: 'error',
                    });
                    return of(error);
                })
            )
        );
    }

    deleteShipCompanyPortMap(config: PortMapsItem) {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            portReportStatus: 'loading',
        });
        return lastValueFrom(
            this.filesMapApiService.deleteShipCompanyPortMap(config).pipe(
                tap((res) => {
                    if (res.success) {
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            portReportStatus: 'success',
                        });
                    } else {
                        throw res.error;
                    }
                }),
                catchError((error) => {
                    this.coreUIState.openErrorDialog({
                        title: error?.errorTitle
                            ? error.errorTitle
                            : ErrorDialogMessages.inventoryManagement
                                  .portReportDeleteError.title,
                        description:
                            error?.errors &&
                            Array.isArray(error.errors) &&
                            error.errors.length > 0
                                ? error.errors[0]
                                : ErrorDialogMessages.inventoryManagement
                                      .portReportDeleteError.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.inventoryManagement
                                    .portReportDeleteError.buttons.close,
                                isPrimary: true,
                                onClick: () => {
                                    // do nothing
                                },
                            },
                        ],
                    });
                    this.reportFileStatus$.next({
                        ...this.reportFileStatus$.getValue(),
                        portReportStatus: 'error',
                    });
                    return of(error);
                })
            )
        );
    }

    updateInsertShipCompanyTourMap(config: TourMapsItem) {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            tourReportStatus: 'loading',
        });
        return lastValueFrom(
            this.filesMapApiService.updateInsertShipCompanyTourMap(config).pipe(
                tap((res) => {
                    if (res.success) {
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            tourReportStatus: 'success',
                        });
                    } else {
                        throw res.error;
                    }
                }),
                catchError((error) => {
                    this.coreUIState.openErrorDialog({
                        title: error?.errorTitle
                            ? error.errorTitle
                            : ErrorDialogMessages.inventoryManagement
                                  .tourReportEditError.title,
                        description:
                            error?.errors &&
                            Array.isArray(error.errors) &&
                            error.errors.length > 0
                                ? error.errors[0]
                                : ErrorDialogMessages.inventoryManagement
                                      .tourReportEditError.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.inventoryManagement
                                    .tourReportEditError.buttons.close,
                                isPrimary: true,
                                onClick: () => {
                                    // do nothing
                                },
                            },
                        ],
                    });
                    this.reportFileStatus$.next({
                        ...this.reportFileStatus$.getValue(),
                        tourReportStatus: 'error',
                    });
                    return of(error);
                })
            )
        );
    }

    deleteShipCompanyTourMap(config: TourMapsItem) {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            tourReportStatus: 'loading',
        });
        return lastValueFrom(
            this.filesMapApiService.deleteShipCompanyTourMap(config).pipe(
                tap((res) => {
                    if (res.success) {
                        this.reportFileStatus$.next({
                            ...this.reportFileStatus$.getValue(),
                            tourReportStatus: 'success',
                        });
                    } else {
                        throw res.error;
                    }
                }),
                catchError((error) => {
                    this.coreUIState.openErrorDialog({
                        title: error?.errorTitle
                            ? error.errorTitle
                            : ErrorDialogMessages.inventoryManagement
                                  .tourReportDeleteError.title,
                        description:
                            error?.errors &&
                            Array.isArray(error.errors) &&
                            error.errors.length > 0
                                ? error.errors[0]
                                : ErrorDialogMessages.inventoryManagement
                                      .tourReportDeleteError.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.inventoryManagement
                                    .tourReportDeleteError.buttons.close,
                                isPrimary: true,
                                onClick: () => {
                                    // do nothing
                                },
                            },
                        ],
                    });
                    this.reportFileStatus$.next({
                        ...this.reportFileStatus$.getValue(),
                        tourReportStatus: 'error',
                    });
                    return of(error);
                })
            )
        );
    }

    validateAndUploadCruiseLinePreSalesData(
        config: UploadFileItem,
        formData: FormData
    ) {
        this.reportFileStatus$.next({
            ...this.reportFileStatus$.value,
            fileUploadStatus: 'loading',
        });
        if (!this.checkIfFileHeaderExists(config.shipCompanyId)) {
            config.shipCompanyName = config.shipCompanyName + '-(Generic)';
        }

        return lastValueFrom(
            this.filesMapApiService
                .validateAndUploadCruiseLinePreSalesData(config, formData)
                .pipe(
                    tap((res) => {
                        if (res == 'Success') {
                            this.reportFileStatus$.next({
                                ...this.reportFileStatus$.getValue(),
                                fileUploadStatus: 'success',
                            });
                        } else {
                            throw res;
                        }
                    }),
                    catchError(
                        (error: {
                            error: string[];
                            message: string;
                            name: string;
                            ok: boolean;
                            status: number;
                            statusText: string;
                            url: string;
                        }) => {
                            if (
                                error &&
                                Array.isArray(error) &&
                                error.length > 0
                            ) {
                                this.reportFileStatus$.next({
                                    ...this.reportFileStatus$.getValue(),
                                    fileUploadStatus: 'error',
                                    fileUploadErrorMessages: error,
                                });
                                return of(error);
                            } else if (
                                error &&
                                error?.error?.length > 0 &&
                                error?.status == 400
                            ) {
                                this.reportFileStatus$.next({
                                    ...this.reportFileStatus$.getValue(),
                                    fileUploadStatus: 'error',
                                    fileUploadErrorMessages: error.error,
                                });
                                return of(error);
                            } else {
                                let stringified = '';
                                if (error?.error?.length > 0) {
                                    error.error.forEach((element: string) => {
                                        stringified += element + ' ';
                                    });
                                }

                                this.coreUIState.openErrorDialog({
                                    title: ErrorDialogMessages
                                        .inventoryManagement
                                        .salesDataUploadError.title,
                                    description: stringified
                                        ? stringified
                                        : ErrorDialogMessages
                                              .inventoryManagement
                                              .salesDataUploadError.description,
                                    buttons: [
                                        {
                                            text: ErrorDialogMessages
                                                .inventoryManagement
                                                .salesDataUploadError.buttons
                                                .close,
                                            isPrimary: true,
                                            onClick: () => {
                                                // do nothing
                                            },
                                        },
                                    ],
                                });
                                return of(error);
                            }
                        }
                    )
                )
        );
    }

    private checkIfFileHeaderExists(shipCompanyId: number) {
        const cruises = this.reportingTableData$.getValue().fileHeaders;
        return cruises.some((cruise) => cruise.shipCompanyId === shipCompanyId);
    }
}
