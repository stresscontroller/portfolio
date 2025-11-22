import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    map,
    takeUntil,
} from 'rxjs';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { FeedbackService, UIStatus } from '@app/core';
import { AssignmentsState, UIState } from '../../../state';
import { BarcodeFormat } from '@zxing/library';
import { LoaderEmbedComponent } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-check-in-modal',
    templateUrl: './check-in.component.html',
    styleUrls: ['./check-in.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        ZXingScannerModule,
        LoaderEmbedComponent,
    ],
})
export class CheckInModalComponent {
    feedbackService = inject(FeedbackService);
    assignmentsState = inject(AssignmentsState);
    uiState = inject(UIState);

    emailPdf = new FormGroup({
        email: new FormControl('', {
            validators: [Validators.required],
            nonNullable: true,
        }),
    });
    allowedFormats = [BarcodeFormat.QR_CODE];

    checkInModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.checkIn),
        distinctUntilChanged()
    );

    isOpen$ = this.checkInModal$.pipe(map((modal) => modal.isOpen));

    status$ = new BehaviorSubject<UIStatus>('idle');
    scannerEnabled = false;
    private isDestroyed$ = new Subject<void>();

    stage: 'scan' | 'checkinLoading' | 'checkinSuccess' | 'checkinError' =
        'scan';
    bookingDetails$ = new BehaviorSubject<
        | {
              name: string;
              time: string;
              tourName: string;
              shipName: string;
          }
        | undefined
    >(undefined);

    private hadSuccessfulCheckin = false;

    ngOnInit(): void {
        this.isOpen$.pipe(takeUntil(this.isDestroyed$)).subscribe((isOpen) => {
            if (isOpen) {
                this.scannerEnabled = true;
            } else {
                this.scannerEnabled = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    onScanSuccess(qrdata: string): void {
        const bookingId = /[^/]*$/.exec(qrdata)?.[0];
        this.feedbackService.vibrate();
        this.feedbackService.playSoundEffect('beep');
        if (bookingId) {
            this.checkin(+bookingId);
            return;
        }
        // if no sufficient information, display error
        this.stage = 'checkinError';
    }

    reset(): void {
        this.bookingDetails$.next(undefined);
        this.stage = 'scan';
    }

    private checkin(bookingId: number): void {
        this.stage = 'checkinLoading';
        this.assignmentsState
            .getBookingAndTourDetails(bookingId)
            .then((res) => {
                const currentBooking = res.find(
                    (reservation) => reservation.booking.bookingID === bookingId
                );
                if (currentBooking) {
                    // start checkin flow
                    this.assignmentsState
                        .checkinBooking(bookingId)
                        .then(() => {
                            this.hadSuccessfulCheckin = true;
                            this.stage = 'checkinSuccess';
                            this.bookingDetails$.next({
                                name: `${
                                    currentBooking?.booking?.leadFirstName || ''
                                } ${currentBooking?.booking?.leadLastName}`,
                                time: this.formatTourInventoryTime(
                                    currentBooking?.tour?.tourInventoryTime
                                ),
                                tourName: currentBooking?.tour?.tourName,
                                shipName: currentBooking?.booking?.shipName,
                            });
                        })
                        .catch(() => {
                            this.stage = 'checkinError';
                        });
                } else {
                    this.stage = 'checkinError';
                }
            })
            .catch(() => {
                this.stage = 'checkinError';
            });
    }

    close(): void {
        if (this.hadSuccessfulCheckin) {
            this.assignmentsState.refresh(true);
        }
        this.hadSuccessfulCheckin = false;
        this.status$.next('idle');
        this.reset();
        this.uiState.closeCheckInModal();
    }

    private formatTourInventoryTime(time: string): string {
        if (!time) {
            return '';
        }
        try {
            return time.substring(0, time.lastIndexOf(':'));
        } catch (error) {
            return '';
        }
    }
}
