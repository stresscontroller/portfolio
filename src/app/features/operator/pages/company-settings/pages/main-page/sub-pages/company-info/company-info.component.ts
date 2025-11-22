import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Subject, lastValueFrom, map, takeUntil, BehaviorSubject } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { DividerModule } from 'primeng/divider';

import { CompanyInfoState } from './company-info.state';

import {
    UIStatus,
    StatesList,
    CountryList,
    TourInventoryApiService,
} from '@app/core';
import {
    PhoneNumberComponent,
    LoaderEmbedComponent,
    PermissionDirective,
} from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-company-info',
    templateUrl: './company-info.component.html',
    styleUrls: ['./company-info.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        PhoneNumberComponent,
        InputTextareaModule,
        DividerModule,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
    providers: [CompanyInfoState],
})
export class CompanyInfoComponent {
    companyInfoState = inject(CompanyInfoState);
    tourInventoryApiService = inject(TourInventoryApiService);

    private destroyed$ = new Subject<void>();
    private isDestroyed$ = new Subject<void>();
    currencyList$ = this.companyInfoState.currencyList$;
    timeZoneList$ = this.companyInfoState.timeZoneList$;
    countries: CountryList[] = [];
    states: StatesList[] = [];
    measurementUnitList: string[] = ['Metric', 'SAE'];
    logoImgSrc$ = new BehaviorSubject<string | undefined>(undefined);

    status$ = new BehaviorSubject<UIStatus>('idle');
    companyId: number = 0;
    companyUniqueID: string = '';
    isActive: boolean = false;
    isMasterCompany: boolean = false;
    defaultPortId: number = 0;
    companyInfoForm = new FormGroup({
        companyName: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        email: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        generalPhone: new FormControl('', [Validators.required]),
        customerService: new FormControl('', [Validators.required]),
        fax: new FormControl('', [Validators.required]),
        address: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        address2: new FormControl(''),
        state: new FormControl<number | null>(null, [
            Validators.required,
            Validators.maxLength(200),
        ]),
        country: new FormControl<number | null>(null, [
            Validators.required,
            Validators.maxLength(200),
        ]),
        zip: new FormControl('', [Validators.required]),
        facebookURL: new FormControl(''),
        intagramHandle: new FormControl(''),
        twitterURL: new FormControl(''),
        companyWebsite: new FormControl(''),
        companyDescription: new FormControl('', [Validators.required]),
        administrator: new FormControl('', [Validators.required]),
        companyPassCode: new FormControl('', [Validators.required]),
        defaultMeasurementUnit: new FormControl('', [Validators.required]),
        defaultCCY: new FormControl('', [Validators.required]),
        timeZone: new FormControl('', [Validators.required]),
    });

    ngOnInit(): void {
        this.companyInfoState.init();
        this.loadCountries().then(() => {
            this.companyInfoForm.controls.country.valueChanges
                .pipe(takeUntil(this.isDestroyed$))
                .subscribe((country) => {
                    this.companyInfoForm.controls.state.reset();
                    if (country) {
                        this.loadStates(country);
                    }
                });
        });
        this.setupForm();
    }

    setupForm(): void {
        this.companyInfoForm.get('companyName')?.disable();
        this.companyInfoForm.get('companyPassCode')?.disable();
        this.companyInfoState.companyInfo$.subscribe((companyInfo) => {
            if (companyInfo) {
                this.companyId = companyInfo.companyID;
                this.companyUniqueID = companyInfo.companyUniqueID;
                this.isActive = companyInfo.isActive;
                this.isMasterCompany = companyInfo.isMasterCompany ?? false;
                this.defaultPortId = companyInfo.defaultPortId;
                const logo = `data:image/png;base64, ${companyInfo.companyLogo}`;
                this.logoImgSrc$.next(logo);
                this.companyInfoForm.patchValue({
                    ...companyInfo,
                });
            }
        });
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

    onImageSelect(event: Event): void {
        const file = (<HTMLInputElement>event.target).files?.[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            this.logoImgSrc$.next(base64String);
        };
        reader.readAsDataURL(file);
    }

    saveCompanyInfo(): void {
        if (this.companyInfoForm.invalid) {
            Object.values(this.companyInfoForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.companyInfoForm.getRawValue();
        let defaultCCYSymbol: string = '';
        this.currencyList$
            .pipe(
                map((currencyList) =>
                    currencyList.find(
                        (currency) =>
                            currency.currencyCode === formValues.defaultCCY
                    )
                )
            )
            .subscribe((currency) => {
                defaultCCYSymbol = currency?.currencySymbol ?? '';
            });
        let companyLogo: string = '';
        this.logoImgSrc$.subscribe((logo) => {
            if (logo) {
                const logoArr = logo.split('base64,');
                companyLogo = logoArr[1];
            }
        });

        this.companyInfoState.saveCompanyInfo({
            companyID: this.companyId,
            companyUniqueID: this.companyUniqueID,
            companyName: formValues.companyName ?? '',
            companyPassCode: formValues.companyPassCode ?? '',
            isActive: this.isActive,
            lastModifiedDate: '2024-09-03T13:41:17.037Z',
            lastModifiedBy: 'Robert Murphy',
            createdDate: '2024-09-03T13:41:17.037Z',
            createdBy: 'Robert Murphy',
            administrator: formValues.administrator ?? '',
            isMasterCompany: this.isMasterCompany,
            companyLogo: companyLogo,
            address: formValues.address ?? '',
            address2: formValues.address2 ?? '',
            country: formValues.country ?? 0,
            state: formValues.state ?? 0,
            zip: formValues.zip ?? '',
            generalPhone: formValues.generalPhone ?? '',
            customerService: formValues.customerService ?? '',
            fax: formValues.fax ?? '',
            email: formValues.email ?? '',
            facebookURL: formValues.facebookURL ?? '',
            intagramHandle: formValues.intagramHandle ?? '',
            twitterURL: formValues.twitterURL ?? '',
            defaultPortId: this.defaultPortId,
            strCompanyID: String(this.companyId),
            companyWebsite: formValues.companyWebsite ?? '',
            companyDescription: formValues.companyDescription ?? '',
            defaultMeasurementUnit: formValues.defaultMeasurementUnit ?? '',
            defaultCCY: formValues.defaultCCY ?? '',
            defaultCCY_Symbol: defaultCCYSymbol,
            timeZone: formValues.timeZone ?? '',
        });
    }

    reset(): void {
        this.status$.next('idle');
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
