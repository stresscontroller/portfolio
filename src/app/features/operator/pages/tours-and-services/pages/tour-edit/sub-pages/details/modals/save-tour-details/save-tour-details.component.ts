import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    filter,
    map,
    distinctUntilChanged,
    BehaviorSubject,
    takeUntil,
    Subject,
    combineLatest,
} from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ColorPickerModule } from 'primeng/colorpicker';

import { OperatorFiltersState, TourDetailsConfig, UIStatus } from '@app/core';
import { TourDetailsState, UIState } from '../../state';
import { ToursAndServicesState } from 'src/app/features/operator/pages/tours-and-services/state';

@Component({
    standalone: true,
    selector: 'app-save-tour-details-modal',
    templateUrl: './save-tour-details.component.html',
    styleUrls: ['./save-tour-details.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        DialogModule,
        CommonModule,
        DividerModule,
        DropdownModule,
        ButtonModule,
        CalendarModule,
        ColorPickerModule,
        CheckboxModule,
        InputTextModule,
        InputTextareaModule,
    ],
})
export class SaveTourDetailsModalComponent {
    uiState = inject(UIState);
    operatorFiltersState = inject(OperatorFiltersState);
    tourDetailsListState = inject(TourDetailsState);
    toursAndServicesState = inject(ToursAndServicesState);
    ports$ = this.operatorFiltersState.ports$;
    faqCategories$ = this.toursAndServicesState.faqCategories$;
    addOns$ = this.toursAndServicesState.addOns$;
    saveTourDetails$ = this.uiState.modals$.pipe(
        map((modals) => modals.saveTourDetails),
        distinctUntilChanged()
    );

    isOpen$ = this.saveTourDetails$.pipe(map((modal) => modal.isOpen));
    context$ = this.saveTourDetails$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    tourDetails$ = new BehaviorSubject<
        | (TourDetailsConfig & {
              portNameDisp: string;
              faqsDisp: string[];
              addOnsDisp: string[];
          })
        | undefined
    >(undefined);
    status$ = new BehaviorSubject<UIStatus>('idle');

    private isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.setTourDetails();
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    setTourDetails(): void {
        combineLatest([
            this.context$,
            this.ports$,
            this.faqCategories$,
            this.addOns$,
        ])
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe(([context, ports, faqCategories, addOnList]) => {
                if (context) {
                    this.tourDetails$.next({
                        ...context,
                        portNameDisp:
                            ports.find((p) => p.portId === context.portId)
                                ?.portName || '',
                        faqsDisp: context.faqCategoryList
                            .map((faqId) => {
                                return (
                                    faqCategories?.find(
                                        (faqCategory) =>
                                            faqCategory.faqCategoryId === faqId
                                    )?.categoryName ?? ''
                                );
                            })
                            .filter((faq) => !!faq),
                        addOnsDisp: context.addOns
                            .map((addonId) => {
                                return (
                                    addOnList?.find(
                                        (addOn) => addOn.addonsId === addonId
                                    )?.name ?? ''
                                );
                            })
                            .filter((addon) => !!addon),
                    });
                } else {
                    this.tourDetails$.next(undefined);
                }
            });
    }

    save(): void {
        const tourDetails = this.tourDetails$.getValue();
        if (!tourDetails) {
            this.status$.next('error');
            return;
        }
        this.status$.next('loading');
        this.tourDetailsListState
            .saveTourDetails({
                tourId: 0,
                companyId: '',
                createdBy: '',
                TourName: tourDetails.tourName ?? '',
                tourShortName: tourDetails.tourShortName ?? '',
                unitInMeter: tourDetails.unitInMeter ?? '',
                description: tourDetails.description ?? '',
                maxCapacity: tourDetails.maxCapacity ?? 0,
                minCapacity: tourDetails.minCapacity ?? 0,
                adultPrice: tourDetails.adultPrice ?? 0,
                childPrice: tourDetails.childPrice ?? 0,
                minAge: tourDetails.minAge ?? 0,
                minWeight: tourDetails.minWeight ?? 0,
                maxWeight: tourDetails.maxWeight ?? 0,
                physicalLevel: tourDetails.physicalLevel ?? '',
                duration: tourDetails.duration ?? '',
                calendarColor: tourDetails.calendarColor ?? '#000000',
                minHeight: tourDetails.minHeight ?? 0,
                salesTax: tourDetails.salesTax ?? 0,
                isLiabilityReleaseRequired:
                    tourDetails.isLiabilityReleaseRequired ?? false,
                isParticipantCannotBePregnant:
                    tourDetails.isParticipantCannotBePregnant ?? false,
                isParticipantCannotHaveaBackInjury:
                    tourDetails.isParticipantCannotHaveaBackInjury ?? false,
                shortDescription: tourDetails.shortDescription ?? '',
                portId: tourDetails.portId ?? 0,
                FAQCategories: tourDetails.faqCategoryList.join(',') ?? '',
            })
            .then(() => {
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    close(): void {
        this.status$.next('idle');
        this.uiState.closeSaveTourDetailsModal();
    }
}
