import { Component, inject } from '@angular/core';
import { UserListState } from '../../user-list.state';
import {
    BehaviorSubject,
    Subject,
    debounceTime,
    distinctUntilChanged,
    filter,
    lastValueFrom,
    map,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
    TourInventoryApiService,
    StatesList,
    CountryList,
    UserDetailsConfig,
    OperatorFiltersState,
    debounceTimes,
    UIStatus,
    ZipCodeValidator,
} from '@app/core';
import { PhoneNumberComponent } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-add-new-user',
    templateUrl: './add-new-user.component.html',
    styleUrls: ['./add-new-user.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        InputTextModule,
        DropdownModule,
        PhoneNumberComponent,
    ],
})
export class AddNewUserComponent {
    userListState = inject(UserListState);
    tourInventoryApiService = inject(TourInventoryApiService);
    operatorFiltersState = inject(OperatorFiltersState);
    userRoles$ = this.operatorFiltersState.userRoles$;

    addNewUserModal$ = this.userListState.modals$.pipe(
        map((modals) => modals.addNewUser),
        distinctUntilChanged()
    );

    status$ = new BehaviorSubject<UIStatus>('idle');
    isOpen$ = this.addNewUserModal$.pipe(map((modal) => modal.isOpen));

    userForm = new FormGroup({
        profilePicture: new FormControl('', []),
        firstName: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        lastName: new FormControl('', [
            Validators.required,
            Validators.maxLength(200),
        ]),
        userRole: new FormControl('', [
            Validators.required,
            Validators.required,
        ]),
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
        stateId: new FormControl(null, [
            Validators.required,
            Validators.maxLength(200),
        ]),
        countryId: new FormControl(null, [
            Validators.required,
            Validators.maxLength(200),
        ]),
        zipcode: new FormControl('', [Validators.required, ZipCodeValidator]),
    });
    states: StatesList[] = [];
    countries: CountryList[] = [];

    private destroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.loadCountries();
        this.operatorFiltersState.getUserRoles();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    ngAfterViewInit(): void {
        this.userForm.controls.countryId.valueChanges
            .pipe(
                takeUntil(this.destroyed$),
                filter((res) => !!res),
                debounceTime(debounceTimes.formDebounce)
            )
            .subscribe((selectedCountry) => {
                this.loadStates(selectedCountry ? +selectedCountry : undefined);
                this.userForm.controls.stateId.reset();
            });
    }

    save() {
        if (this.userForm.invalid) {
            Object.values(this.userForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        this.status$.next('loading');
        const userDetailFormItems = this.userForm.getRawValue();
        const userDetails: UserDetailsConfig = {
            userId: '',
            nickName: '',
            secondaryEmail: '',
            roleId: userDetailFormItems.userRole ?? '',
            roleName: '',
            isEmployee: true, // idk where this is set
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
        this.userListState
            .addNewUser(userDetails)
            .then(() => {
                this.close();
                this.status$.next('idle');
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.userForm.reset();
        this.userListState.closeAddNewUserModal();
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

    loadStates(country?: number): Promise<StatesList[]> {
        this.states = [];
        if (country) {
            return lastValueFrom(
                this.tourInventoryApiService
                    .getStateList(country)
                    .pipe(map((res) => res.data))
            ).then((data) => {
                this.states = data;
                return data;
            });
        }
        return Promise.resolve([]);
    }
}
