import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ManageService } from '../../manage.service';
import { Subject, takeUntil } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputMasks, PassengerInformation, AuthServiceCommon } from '@app/core';
import { PermissionConfig, PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-passenger-information',
    templateUrl: './passenger-information.component.html',
    styleUrls: ['./passenger-information.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        DialogModule,
        InputMaskModule,
        PermissionDirective,
    ],
})
export class PassengerInformationComponent {
    @Input() updatePermission?: PermissionConfig;
    manageService = inject(ManageService);
    authService = inject(AuthServiceCommon);
    masks = InputMasks;
    isInhouseAgent$ = this.authService.isInhouseAgent$;

    passengerInfoForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        phoneNumber: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        shipName: new FormControl('', Validators.required),
        shipCompanyName: new FormControl('', Validators.required),
    });

    displayEditDialog = false;

    private readonly isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.passengerInfoForm.valueChanges
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((res) => {
                this.manageService.updatePassengerInformation(
                    res as PassengerInformation
                );
            });

        this.manageService.bookingGeneralInfo$
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((res) => {
                if (res) {
                    this.passengerInfoForm.patchValue(
                        {
                            firstName: res.bookingFName || '',
                            lastName: res.bookingLName || '',
                            phoneNumber: res.bookingPhone || '',
                            email:
                                this.authService.isInHouseAgent() ||
                                !this.authService.isAgent()
                                    ? res.bookingEmail
                                    : res.agentsGuestEmail || res.bookingEmail,
                        },
                        { emitEvent: false }
                    );
                }
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next(undefined);
        this.isDestroyed$.complete();
    }

    showEditDialog() {
        this.displayEditDialog = true;
    }
}
