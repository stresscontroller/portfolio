import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, distinctUntilChanged, BehaviorSubject } from 'rxjs';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ColorPickerModule } from 'primeng/colorpicker';

import { OperatorFiltersState, UIStatus, UserState } from '@app/core';
import { TourListState, UIState } from '../../../state';
import { ToursAndServicesState } from '../../../../../../../state';

@Component({
    standalone: true,
    selector: 'app-add-new-tour-modal',
    templateUrl: './add-new-tour.component.html',
    styleUrls: ['./add-new-tour.component.scss'],
    imports: [
        ReactiveFormsModule,
        DialogModule,
        CommonModule,
        DividerModule,
        DropdownModule,
        ButtonModule,
        CalendarModule,
        CheckboxModule,
        InputTextModule,
        InputTextareaModule,
        MultiSelectModule,
        InputIconModule,
        ColorPickerModule,
        IconFieldModule,
    ],
})
export class AddNewTourModalComponent {
    uiState = inject(UIState);
    userState = inject(UserState);
    tourListState = inject(TourListState);
    toursAndServicesState = inject(ToursAndServicesState);
    operatorFiltersState = inject(OperatorFiltersState);
    addNewTour$ = this.uiState.modals$.pipe(
        map((modals) => modals.addNewTour),
        distinctUntilChanged()
    );

    isOpen$ = this.addNewTour$.pipe(map((modal) => modal.isOpen));
    ports$ = this.operatorFiltersState.ports$;
    faqCategories$ = this.toursAndServicesState.faqCategories$;
    addOns$ = this.toursAndServicesState.addOns$;

    status$ = new BehaviorSubject<UIStatus>('idle');

    addNewTourForm = new FormGroup({
        tourName: new FormControl('', [Validators.required]),
        tourShortName: new FormControl('', [Validators.required]),
        physicalLevel: new FormControl('', [Validators.required]),
        hours: new FormControl<number | null>(null, [
            Validators.required,
            Validators.maxLength(2),
        ]),
        minutes: new FormControl<number | null>(null, [
            Validators.required,
            Validators.maxLength(2),
        ]),
        portId: new FormControl<number | null>(null, [Validators.required]),
        faqCategoryList: new FormControl<number[]>([], [Validators.required]),
        minWeight: new FormControl(0),
        maxWeight: new FormControl(0),
        minAge: new FormControl(0),
        minHeight: new FormControl(0),
        minCapacity: new FormControl<number | null>(null, [
            Validators.required,
        ]),
        maxCapacity: new FormControl<number | null>(null, [
            Validators.required,
        ]),
        isLiabilityReleaseRequired: new FormControl(false),
        isParticipantCannotHaveaBackInjury: new FormControl(false),
        isParticipantCannotBePregnant: new FormControl(false),
        adultPrice: new FormControl<number | null>(null, [Validators.required]),
        childPrice: new FormControl<number | null>(null, [Validators.required]),
        salesTax: new FormControl<number | null>(null, [Validators.required]),
        addOns: new FormControl<number[]>([]),
        shortDescription: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        calendarColor: new FormControl<string | null>('#000000'),
    });

    tourPhysicalLevel: string[] = ['Easy', 'Moderate', 'Strenuous'];

    ngOnInit(): void {
        this.operatorFiltersState.getPorts();
    }

    save(): void {
        if (this.addNewTourForm.invalid) {
            Object.values(this.addNewTourForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        this.status$.next('loading');
        const formValues = this.addNewTourForm.value;
        const duration = `${
            formValues.hours ? `00${formValues.hours}`.slice(-2) : '00'
        }:${
            formValues.minutes ? `00${formValues.minutes}`.slice(-2) : '00'
        }:00`;
        this.userState
            .getAspNetUser()
            .then((user) => {
                if (!user?.companyUniqueID || !user?.b2CUserId) {
                    return Promise.reject('missing user information');
                }
                return this.tourListState.saveTour({
                    tourId: 0,
                    TourName: formValues.tourName ?? '',
                    tourShortName: formValues.tourShortName ?? '',
                    unitInMeter: 'SAE',
                    companyId: user.companyUniqueID,
                    createdBy: user.b2CUserId,
                    description: formValues.description ?? '',
                    maxCapacity: formValues.maxCapacity ?? 0,
                    minCapacity: formValues.minCapacity ?? 0,
                    adultPrice: formValues.adultPrice ?? 0,
                    childPrice: formValues.childPrice ?? 0,
                    minAge: formValues.minAge ?? 0,
                    minWeight: formValues.minWeight ?? 0,
                    maxWeight: formValues.maxWeight ?? 0,
                    physicalLevel: formValues.physicalLevel ?? '',
                    duration: duration,
                    calendarColor: formValues.calendarColor ?? '#000000',
                    minHeight: formValues.minHeight ?? 0,
                    salesTax: formValues.salesTax ?? 0,
                    isLiabilityReleaseRequired:
                        formValues.isLiabilityReleaseRequired ?? false,
                    isParticipantCannotBePregnant:
                        formValues.isParticipantCannotBePregnant ?? false,
                    isParticipantCannotHaveaBackInjury:
                        formValues.isParticipantCannotHaveaBackInjury ?? false,
                    shortDescription: formValues.shortDescription ?? '',
                    portId: formValues.portId ?? 0,
                    FAQCategories: formValues.faqCategoryList?.join(', ') ?? '',
                });
            })
            .then(() => {
                this.tourListState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeAddNewTourModal();
    }
}
