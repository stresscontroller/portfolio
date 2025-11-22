import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormsModule,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Subject, map, takeUntil } from 'rxjs';

import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputNumberModule } from 'primeng/inputnumber';
import { ColorPickerModule } from 'primeng/colorpicker';

import { Features, OperatorFiltersState, TourDetailsConfig } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

import { TourEditState } from '../../state';
import { SaveTourDetailsModalComponent } from './modals';
import { TourDetailsState, UIState } from './state';
import { ToursAndServicesState } from '../../../../state';

@Component({
    standalone: true,
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DividerModule,
        InputTextModule,
        DropdownModule,
        MultiSelectModule,
        InputGroupModule,
        InputGroupAddonModule,
        CheckboxModule,
        InputTextareaModule,
        InputNumberModule,
        ButtonModule,
        IconFieldModule,
        InputIconModule,
        ColorPickerModule,
        LoaderEmbedComponent,
        SaveTourDetailsModalComponent,
        PermissionDirective,
    ],
    providers: [TourDetailsState, UIState],
})
export class DetailsComponent {
    uiState = inject(UIState);
    tourEditState = inject(TourEditState);
    toursAndServicesState = inject(ToursAndServicesState);
    operatorFiltersState = inject(OperatorFiltersState);
    features = Features;
    faqCategories$ = this.toursAndServicesState.faqCategories$;
    addOns$ = this.toursAndServicesState.addOns$;
    tourDetails$ = this.tourEditState.tourDetails$;
    status$ = this.tourEditState.status$.pipe(
        map((status) => status.loadTourDetails)
    );
    ports$ = this.operatorFiltersState.ports$;
    tourDetailsForm = new FormGroup({
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
        minWeight: new FormControl<number | 0>(0, [Validators.required]),
        maxWeight: new FormControl<number | 0>(0, [Validators.required]),
        minAge: new FormControl<number | 0>(0, [Validators.required]),
        minHeight: new FormControl<number | 0>(0, [Validators.required]),
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
        addOns: new FormControl<number[]>([], [Validators.required]),
        shortDescription: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        defaultMeasurementUnit: new FormControl<string | null>(''),
        calendarColor: new FormControl<string | null>('', [
            Validators.required,
        ]),
    });

    tourPhysicalLevel: string[] = ['Easy', 'Moderate', 'Strenuous'];

    private isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.operatorFiltersState.getPorts();

        this.tourDetails$
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((tourDetails) => {
                if (tourDetails) {
                    const faqsConfig: number[] = [];
                    tourDetails.faqCategoryList.map((faq) => {
                        faqsConfig.push(faq.categoryId);
                    });
                    this.tourDetailsForm.patchValue(
                        {
                            ...tourDetails,
                            faqCategoryList: faqsConfig,
                            hours: +tourDetails.duration.split(':')[0],
                            minutes: +tourDetails.duration.split(':')[1],
                            calendarColor: tourDetails.calendarColor
                                ? tourDetails.calendarColor
                                : '#000000',
                        },
                        {
                            emitEvent: false,
                        }
                    );
                }
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    openEditTourModal(): void {
        if (this.tourDetailsForm.invalid) {
            Object.values(this.tourDetailsForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.tourDetailsForm.getRawValue();
        const duration = `${
            formValues.hours ? `00${formValues.hours}`.slice(-2) : '00'
        }:${
            formValues.minutes ? `00${formValues.minutes}`.slice(-2) : '00'
        }:00`;
        const config: TourDetailsConfig = {
            tourName: formValues.tourName ?? '',
            physicalLevel: formValues.physicalLevel ?? '',
            duration: duration,
            portId: formValues.portId ?? 0,
            faqCategoryList: formValues.faqCategoryList ?? [],
            minWeight: formValues.minWeight ?? 0,
            maxWeight: formValues.maxWeight ?? 0,
            minHeight: formValues.minHeight ?? 0,
            minAge: formValues.minAge ?? 0,
            minCapacity: formValues.minCapacity ?? 0,
            maxCapacity: formValues.maxCapacity ?? 0,
            adultPrice: formValues.adultPrice ?? 0,
            childPrice: formValues.childPrice ?? 0,
            salesTax: formValues.salesTax ?? 0,
            addOns: formValues.addOns ?? [],
            description: formValues.description ?? '',
            shortDescription: formValues.shortDescription ?? '',
            tourShortName: formValues.tourShortName ?? '',
            unitInMeter: formValues?.defaultMeasurementUnit ?? '',
            isLiabilityReleaseRequired:
                formValues.isLiabilityReleaseRequired ?? false,
            isParticipantCannotBePregnant:
                formValues.isParticipantCannotBePregnant ?? false,
            isParticipantCannotHaveaBackInjury:
                formValues.isParticipantCannotHaveaBackInjury ?? false,
            calendarColor: formValues.calendarColor ?? '#000000',
        };
        this.uiState.openSaveTourDetailsModal(config);
    }
}
