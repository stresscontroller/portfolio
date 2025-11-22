import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { AssignmentsState, UIState } from '../../../../../state';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import {
    AgentUser,
    AppAssignment,
    OTCBookingItem,
    OperatorFiltersState,
    UserState,
} from '@app/core';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { BehaviorSubject, from, of, switchMap } from 'rxjs';
import { PhoneNumberComponent } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-dtd-edit-booking',
    templateUrl: './dtd-edit-booking.component.html',
    styleUrls: ['./dtd-edit-booking.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        InputTextareaModule,
        DropdownModule,
        CheckboxModule,
        PhoneNumberComponent,
    ],
})
export class DtdEditBookingComponent {
    @Input() assignment: AppAssignment | undefined = undefined;
    @Input() set booking(value: OTCBookingItem | undefined) {
        this._booking = value;
        this.operatorFiltersState.getAgentUsers().then((agents) => {
            const agent = agents.find(
                (agent) => agent.partnerId === value?.agentId
            );

            if (value) {
                this.updateBookingForm.patchValue({
                    firstName: value.firstName,
                    lastName: value.lastName,
                    adults: value.adults,
                    children: value.children,
                    email: value.agentsGuestEmail,
                    agent: agent || null,
                    infants: value.infants,
                    phoneNumber: value.phoneNumber,
                    notes: value.notes,
                    cruiseLine: value.shipCompanyId,
                    shipId: value.shipId,
                    isComplimentary: !!value.isComplimentary,
                    pickupLocationId: +(
                        value.bookingPickUp?.replace('PL-', '') || ''
                    ),
                });
            }
        });
    }
    @Output() closePanel = new EventEmitter<void>();
    @Output() reloadBookings = new EventEmitter<void>();

    assignmentState = inject(AssignmentsState);
    operatorFiltersState = inject(OperatorFiltersState);
    uiState = inject(UIState);
    userState = inject(UserState);
    private _booking: OTCBookingItem | undefined;

    totalPassengersValidator = (editableFieldsFormControl: AbstractControl) => {
        const adults = editableFieldsFormControl.get('adults')?.value;
        const children = editableFieldsFormControl.get('children')?.value;
        let error = null;
        const totalParticipants = adults + children;
        if (totalParticipants === 0) {
            error = { totalPassengersIsZero: true };
        }
        editableFieldsFormControl.get('adults')?.setErrors(error);
        editableFieldsFormControl.get('children')?.setErrors(error);
        return error;
    };
    updateBookingForm = new FormGroup(
        {
            agent: new FormControl<AgentUser | null>(null),
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            adults: new FormControl(0),
            children: new FormControl(0),
            infants: new FormControl(0),
            phoneNumber: new FormControl(''),
            email: new FormControl(''),
            cruiseLine: new FormControl<number | null>(null, {
                nonNullable: true,
            }),
            shipId: new FormControl(0),
            pickupLocationId: new FormControl<number | null>(null),
            notes: new FormControl(''),
            isComplimentary: new FormControl<boolean>(false),
        },
        {
            validators: this.totalPassengersValidator,
        }
    );
    status$ = new BehaviorSubject<'idle' | 'loading' | 'success' | 'error'>(
        'idle'
    );

    agentUsers$ = this.operatorFiltersState.agentUsers$;
    pickupLocations$ = this.operatorFiltersState.docks$;
    cruiseLines$ = this.operatorFiltersState.cruiseLines$;
    cruiseShips$ = this.updateBookingForm.controls.cruiseLine.valueChanges.pipe(
        switchMap((cruiseLine) => {
            if (cruiseLine == null) {
                return of([]);
            }
            const cruiseShips =
                this.operatorFiltersState.cruiseShips$.getValue();
            if (cruiseShips?.[cruiseLine]) {
                return of(cruiseShips[cruiseLine]);
            } else {
                return from(this.operatorFiltersState.getShipList(cruiseLine));
            }
        })
    );

    ngOnInit(): void {
        this.operatorFiltersState.getCruiseLines();
        this.operatorFiltersState.getDocks();
    }

    close(): void {
        this.closePanel.emit();
    }

    save(): void {
        if (!this._booking || !this.assignment) {
            return;
        }
        if (this.updateBookingForm.invalid) {
            Object.values(this.updateBookingForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const userInfo = this.userState.aspNetUser$.getValue();
        if (!userInfo) {
            return;
        }
        this.status$.next('loading');
        const formValue = this.updateBookingForm.getRawValue();
        this.assignmentState
            .addOtcBooking(
                {
                    bookingId: this._booking.bookingId || 0,
                    shipCompanyId: formValue.cruiseLine || 0,
                    shipId: formValue.shipId || 0,
                    pickUpLocation: formValue.pickupLocationId
                        ? `PL-${formValue.pickupLocationId}`
                        : '',
                    bookingFirstName: formValue.firstName || '',
                    bookingLastName: formValue.lastName || '',
                    email: userInfo.email,
                    primaryPhoneNumber: formValue.phoneNumber || '',
                    bookingNotes: formValue.notes || '',
                    createdBy: userInfo.b2CUserId || '',
                    partnerId: +(formValue.agent?.partnerId || 0),
                    agentsGuestEmail: formValue.email || '',
                    companyUniqueID: userInfo.companyUniqueID || '',
                    tourId: this.assignment.tourId,
                    bookingDate:
                        this.assignmentState.configs$
                            .getValue()
                            .dateSelected?.toISOString() || '',
                    bookingTime: this.assignment.tourInventoryTime,
                    tourInventoryId: this.assignment.tourInventoryId,
                    adults: formValue.adults || 0,
                    children: formValue.children || 0,
                    infants: formValue.infants || 0,
                    leadFirstName: formValue.firstName || '',
                    leadLastName: formValue.lastName || '',
                    paymentType: 'InvoiceLater',
                    isOTC: true,
                    isComplimentary: formValue.isComplimentary || false,
                },
                false
            )
            .then(() => {
                this.status$.next('success');
                this.reloadBookings.emit();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
