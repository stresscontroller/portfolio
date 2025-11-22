import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import {
    Subject,
    filter,
    lastValueFrom,
    map,
    startWith,
    takeUntil,
} from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import {
    StatesList,
    CountryList,
    UserDetailsConfig,
    OperatorFiltersState,
    Features,
    UIState,
    ErrorDialogMessages,
    ZipCodeValidator,
} from '@app/core';
import { TourInventoryApiService } from '@app/core';
import { UserEditState } from '../../state';
import { UserInformationState } from './user-information.state';
import {
    FileUploadModule,
    FileUpload,
    FileSelectEvent,
} from 'primeng/fileupload';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { DividerModule } from 'primeng/divider';
import { PhoneNumberComponent } from '@app/shared';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    standalone: true,
    selector: 'app-user-information',
    templateUrl: './user-information.component.html',
    styleUrls: ['./user-information.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        CheckboxModule,
        DropdownModule,
        ButtonModule,
        TooltipModule,
        FileUploadModule,
        PermissionDirective,
        DividerModule,
        LoaderEmbedComponent,
        PhoneNumberComponent,
    ],
    providers: [UserInformationState],
})
export class UserInformationComponent {
    tourInventoryApiService = inject(TourInventoryApiService);
    userInformationState = inject(UserInformationState);
    userEditState = inject(UserEditState);
    uiState = inject(UIState);
    operatorFiltersState = inject(OperatorFiltersState);
    @ViewChild('fileUploadComponent', { static: false })
    fileUploadComponent: FileUpload | undefined;
    features = Features;
    userImage: File | undefined;
    associatedAgents$ = this.operatorFiltersState.associatedAgents$;
    userRoles$ = this.operatorFiltersState.userRoles$;
    userContactForm = new FormGroup({
        firstName: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        lastName: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        nickName: new FormControl(''),
        roleId: new FormControl('', [Validators.required]),
        partnerId: new FormControl<number | null>(null),
        email: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        phoneNumber: new FormControl('', [Validators.required]),
        address: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        address2: new FormControl(''),
        city: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        stateId: new FormControl<number | null>(null, [
            Validators.required,
            Validators.maxLength(200),
        ]),
        countryId: new FormControl<number | null>(null, [
            Validators.required,
            Validators.maxLength(200),
        ]),
        zipcode: new FormControl('', [Validators.required, ZipCodeValidator]),
        isEmployee: new FormControl<boolean>(true),
    });
    states: StatesList[] = [];
    countries: CountryList[] = [];

    status$ = this.userInformationState.status$;
    primaryAgent$ = this.userInformationState.primaryAgent$;

    profilePictureUrl$ = this.userEditState.userDetails$.pipe(
        map((userDetails) => {
            if (userDetails?.profilePicturePath) {
                // prevent caching
                const rand = new Date().getTime();
                return `${userDetails.profilePicturePath}?${rand}`;
            }
            return '';
        })
    );

    private isDestroyed$ = new Subject<void>();
    ngOnInit(): void {
        this.operatorFiltersState.getAssociatedAgents();
        this.operatorFiltersState.getUserRoles(true);
        this.loadCountries().then(() => {
            this.userContactForm.controls.countryId.valueChanges
                .pipe(takeUntil(this.isDestroyed$))
                .subscribe((countryId) => {
                    this.userContactForm.controls.stateId.reset();
                    if (countryId) {
                        this.loadStates(countryId);
                    }
                });
        });
        this.userEditState.userDetails$
            .pipe(
                filter((user) => !!user),
                takeUntil(this.isDestroyed$)
            )
            .subscribe((user) => {
                if (user) {
                    this.userContactForm.patchValue(
                        {
                            firstName: user.firstName || '',
                            lastName: user.lastName || '',
                            roleId: user.roleId?.toLowerCase() || '',
                            nickName: user.nickName || '',
                            email: user.email || '',
                            phoneNumber: user.phoneNumber || '',
                            address: user.address || '',
                            address2: user.address2 || '',
                            city: user.city || '',
                            zipcode: user.zipcode || '',
                            countryId: user.countryId || null,
                            stateId: user.stateId || null,
                            partnerId: user.partnerId || null,
                            isEmployee: user.isEmployee,
                        },
                        { emitEvent: false }
                    );
                    if (user.countryId) {
                        this.loadStates(user.countryId);
                    }
                }
            });

        this.userContactForm.controls.roleId.valueChanges
            .pipe(
                startWith(this.userContactForm.controls.roleId.value),
                takeUntil(this.isDestroyed$)
            )
            .subscribe((roleId) => {
                const defaultPartnerId =
                    this.userEditState.userDetails$.getValue()?.partnerId;
                this.userContactForm.controls.partnerId.setValue(
                    defaultPartnerId || null
                );
                if (roleId) {
                    this.userInformationState
                        .getAssociatedAuthRole(roleId)
                        .then((associatedAuthRoles) => {
                            if (
                                associatedAuthRoles.findIndex(
                                    (authRole) => authRole.name === 'Agent'
                                ) >= 0 &&
                                associatedAuthRoles.findIndex(
                                    (authRole) => authRole.name === 'Employee'
                                ) === -1
                            ) {
                                this.userContactForm.controls.partnerId.enable();
                                this.userContactForm.controls.partnerId.setValidators(
                                    [Validators.required]
                                );
                            } else {
                                this.userContactForm.controls.partnerId.disable();
                                this.userContactForm.controls.partnerId.clearValidators();
                            }
                            this.userContactForm.controls.partnerId.updateValueAndValidity();
                        });
                } else {
                    this.userContactForm.controls.partnerId.disable();
                    this.userContactForm.controls.partnerId.clearValidators();
                    this.userContactForm.controls.partnerId.updateValueAndValidity();
                }
            });

        this.userInformationState.init();
    }
    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    onFileSelect(event: FileSelectEvent) {
        this.userImage = event.files[0];
        if (this.userImage) {
            this.userInformationState
                .saveUserProfilePhoto(this.userImage)
                .then(() => {
                    this.fileUploadComponent?.clear();
                    this.userImage = undefined;
                    this.userInformationState.refresh();
                })
                .catch(() => {
                    this.fileUploadComponent?.clear();
                    this.userImage = undefined;
                    this.uiState.openErrorDialog({
                        title: ErrorDialogMessages.userManagement
                            .saveUserDetailError.title,
                        description:
                            ErrorDialogMessages.userManagement
                                .saveUserDetailError.description,
                        buttons: [
                            {
                                text: ErrorDialogMessages.userManagement
                                    .saveUserDetailError.buttons.close,
                                onClick: () => {},
                                isPrimary: true,
                            },
                        ],
                    });
                });
        }
    }

    submitContactForm() {
        if (this.userContactForm.invalid) {
            Object.values(this.userContactForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const userDetailFormItems = this.userContactForm.getRawValue();
        const selectedRole = this.userRoles$
            .getValue()
            .find((role) => role.id === userDetailFormItems.roleId);
        const userDetails: UserDetailsConfig = {
            userId: '',
            nickName: userDetailFormItems.nickName ?? '',
            secondaryEmail: '',
            roleId: selectedRole?.id ?? '',
            roleName: selectedRole?.name ?? '',
            isEmployee: userDetailFormItems.isEmployee || false,
            firstName: userDetailFormItems.firstName ?? '',
            lastName: userDetailFormItems.lastName ?? '',
            email: userDetailFormItems.email ?? '',
            phoneNumber: userDetailFormItems.phoneNumber ?? '',
            address: userDetailFormItems.address ?? '',
            address2: userDetailFormItems.address2 ?? '',
            city: userDetailFormItems.city ?? '',
            stateId: userDetailFormItems.stateId ?? 0,
            countryId: userDetailFormItems.countryId ?? 0,
            zipcode: userDetailFormItems.zipcode ?? '',
        };
        this.userInformationState
            .saveUserInfo(userDetails)
            .then(() => {
                const currentLinkedAgent =
                    this.userEditState.userDetails$.getValue()?.partnerId;
                if (currentLinkedAgent === userDetailFormItems.partnerId) {
                    return Promise.resolve();
                }
                if (
                    userDetailFormItems.partnerId &&
                    userDetailFormItems.partnerId > 0
                ) {
                    return this.userInformationState.linkUserToAgent(
                        userDetailFormItems.partnerId
                    );
                } else if (
                    currentLinkedAgent &&
                    !userDetailFormItems.partnerId
                ) {
                    return this.userInformationState.unlinkUserFromAgent(
                        currentLinkedAgent
                    );
                }
                return Promise.resolve();
            })
            .then(() => {
                this.fileUploadComponent?.clear();
                this.userImage = undefined;
                this.userInformationState.refresh();
            })
            .catch(() => {
                this.uiState.openErrorDialog({
                    title: ErrorDialogMessages.userManagement
                        .saveUserDetailError.title,
                    description:
                        ErrorDialogMessages.userManagement.saveUserDetailError
                            .description,
                    buttons: [
                        {
                            text: ErrorDialogMessages.userManagement
                                .saveUserDetailError.buttons.close,
                            onClick: () => {},
                            isPrimary: true,
                        },
                    ],
                });
            });
    }

    resetPassword(): void {
        this.userInformationState.resetPassword();
    }

    loadCountries(): Promise<CountryList[]> {
        return lastValueFrom(
            this.tourInventoryApiService
                .getCountryList()
                .pipe(map((res) => res.data))
        ).then((data) => {
            this.countries = data;
            return data;
        });
    }

    loadStates(countryId?: number): Promise<StatesList[]> {
        this.states = [];
        if (countryId) {
            return lastValueFrom(
                this.tourInventoryApiService
                    .getStateList(countryId)
                    .pipe(map((res) => res.data))
            ).then((data) => {
                this.states = data;
                return data;
            });
        }
        return Promise.resolve([]);
    }
}
