import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Subject, filter, lastValueFrom, map, takeUntil } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import {
    StatesList,
    CountryList,
    OperatorFiltersState,
    Features,
    UIState,
    ErrorDialogMessages,
    Agent,
} from '@app/core';
import { TourInventoryApiService } from '@app/core';
import { AgentEditState } from '../../state';
import { FileUploadModule } from 'primeng/fileupload';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { DividerModule } from 'primeng/divider';
import { AccountState } from './account.state';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    standalone: true,
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        DropdownModule,
        ButtonModule,
        TooltipModule,
        FileUploadModule,
        PermissionDirective,
        DividerModule,
        CheckboxModule,
        LoaderEmbedComponent,
    ],
    providers: [AccountState],
})
export class AccountComponent {
    features = Features;
    tourInventoryApiService = inject(TourInventoryApiService);
    operatorFiltersState = inject(OperatorFiltersState);
    agentEditState = inject(AgentEditState);
    accountState = inject(AccountState);
    uiState = inject(UIState);

    savingStatus$ = this.accountState.status$;
    loadingStatus$ = this.agentEditState.status$;

    // TODO: Check against database what will be required
    agentInformationForm = new FormGroup({
        companyName: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        uniqueName: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        contactPersonFirstName: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        contactPersonLastName: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        phoneNumber: new FormControl('', [Validators.required]),
        website: new FormControl('', [Validators.required]),
        email: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        commissionRate: new FormControl<number | null>(null, [
            Validators.required,
        ]),
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
        zipcode: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        allowInvoice: new FormControl<boolean>(false),
        isActive: new FormControl<boolean>(true),
        allowOtc: new FormControl<boolean>(false),
        isCruiseLine: new FormControl<boolean>(false),
        isTaxable: new FormControl<boolean>(false),
    });

    states: StatesList[] = [];
    countries: CountryList[] = [];

    private isDestroyed$ = new Subject<void>();

    submitAgentInformationForm(): void {
        if (this.agentInformationForm.invalid) {
            Object.values(this.agentInformationForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const prevAgentDetails = this.agentEditState.agentDetails$.getValue();
        const agentInformationFormItems =
            this.agentInformationForm.getRawValue();
        const agentDetails: Agent = {
            partnerId: prevAgentDetails?.partnerId || 0,
            partnerName: agentInformationFormItems.companyName || '',
            uniqueName: agentInformationFormItems.uniqueName || '',
            contactPersonFirstName:
                agentInformationFormItems.contactPersonFirstName || '',
            contactPersonLastName:
                agentInformationFormItems.contactPersonLastName || '',
            phoneNumber: agentInformationFormItems.phoneNumber || '',
            companyUniqueId: prevAgentDetails?.companyUniqueId || '',
            email: agentInformationFormItems.email || '',
            address1: agentInformationFormItems.address || '',
            address2: agentInformationFormItems.address2 || '',
            city: agentInformationFormItems.city || '',
            stateId: agentInformationFormItems.stateId || 0,
            countryId: agentInformationFormItems.countryId || 0,
            zipCode: agentInformationFormItems.zipcode || '',
            notes: prevAgentDetails?.notes || '',
            isActive: agentInformationFormItems.isActive || false,
            type: prevAgentDetails?.type || 0,
            commission: agentInformationFormItems.commissionRate || 0,
            allowInvoice: agentInformationFormItems.allowInvoice || false,
            allowOtc: agentInformationFormItems.allowOtc || false,
            website: agentInformationFormItems.website || '',
            isParentCompany: prevAgentDetails?.isParentCompany || false,
            isCruiseLine: agentInformationFormItems.isCruiseLine || false,
            shipCompanyId: prevAgentDetails?.shipCompanyId || 0,
            isTaxable: agentInformationFormItems.isTaxable || false,
        };

        this.accountState
            .saveAgentInfo(agentDetails)
            .then(() => {
                this.agentEditState.refresh();
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

    ngOnInit(): void {
        this.operatorFiltersState.getAssociatedAgents();
        this.operatorFiltersState.getUserRoles(true);
        this.loadCountries().then(() => {
            this.agentInformationForm.controls.countryId.valueChanges
                .pipe(takeUntil(this.isDestroyed$))
                .subscribe((countryId) => {
                    this.agentInformationForm.controls.stateId.reset();
                    if (countryId) {
                        this.loadStates(countryId);
                    }
                });
        });
        this.agentEditState.agentDetails$
            .pipe(
                filter((agent) => !!agent),
                takeUntil(this.isDestroyed$)
            )
            .subscribe((agent) => {
                if (agent) {
                    this.agentInformationForm.patchValue(
                        {
                            companyName: agent.partnerName || '',
                            uniqueName: agent.uniqueName || '',
                            contactPersonFirstName:
                                agent.contactPersonFirstName || '',
                            contactPersonLastName:
                                agent.contactPersonLastName || '',
                            phoneNumber: agent.phoneNumber || '',
                            website: agent.website || '',
                            email: agent.email || '',
                            commissionRate: agent.commission || 0,
                            address: agent.address1 || '',
                            address2: agent.address2 || '',
                            countryId: agent.countryId || undefined,
                            stateId: agent.stateId || undefined,
                            city: agent.city || '',
                            zipcode: agent.zipCode || '',
                            isActive: agent.isActive || null,
                            allowInvoice: agent.allowInvoice || null,
                            allowOtc: agent.allowOtc || null,
                            isCruiseLine: agent.isCruiseLine || null,
                            isTaxable: agent.isTaxable || null,
                        },
                        { emitEvent: false }
                    );
                    if (agent.countryId) {
                        this.loadStates(agent.countryId);
                    }
                }
            });
    }
    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
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
