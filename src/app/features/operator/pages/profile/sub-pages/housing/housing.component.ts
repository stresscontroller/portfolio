import { CommonModule, formatDate } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Features, adjustDate } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';

import { Subject, filter, take, takeUntil } from 'rxjs';

import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';

import { HousingState } from './housing.state';

@Component({
    standalone: true,
    selector: 'app-housing',
    templateUrl: './housing.component.html',
    styleUrls: ['./housing.component.scss'],
    imports: [
        CalendarModule,
        CommonModule,
        DropdownModule,
        InputTextareaModule,
        InputTextModule,
        ReactiveFormsModule,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
    providers: [HousingState],
})
export class HousingComponent {
    features = Features;
    housingState = inject(HousingState);
    housingDataForm = new FormGroup({
        housingLocation: new FormControl<number | null>(null, {
            nonNullable: true,
        }),
        weeklyRent: new FormControl('', [Validators.required]),
        numberOfPets: new FormControl<number>(0),
        petsDeposit: new FormControl(''),
        moveInDate: new FormControl<Date | null>(new Date()),
        notes: new FormControl(''),
    });
    private isDestroyed$ = new Subject<void>();

    status$ = this.housingState.isLoading$;
    locations$ = this.housingState.locations$;

    ngOnInit(): void {
        this.setupForm();
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }

    private async setupForm() {
        await this.housingState.loadLocations();
        await this.housingState.loadHousingData();
        this.housingState.housingData$
            .pipe(
                filter((res) => !!res),
                take(1),
                takeUntil(this.isDestroyed$)
            )
            .subscribe((res) => {
                const housingData = res;
                this.housingDataForm.patchValue({
                    ...res,
                    moveInDate: housingData?.moveInDate
                        ? adjustDate(new Date(housingData.moveInDate))
                        : new Date(),
                    housingLocation: housingData?.housingLocation ?? 0,
                });
            });
    }

    refresh(): void {
        this.housingState.loadHousingData();
    }

    saveHousingData() {
        if (this.housingDataForm.invalid) {
            Object.values(this.housingDataForm.controls).forEach((control) => {
                control.markAsDirty();
                control.markAsTouched();
            });
            return;
        }
        const formValues = this.housingDataForm.getRawValue();
        this.housingState.saveHousingData({
            userId: '',
            housingLocationName: formValues.housingLocation ?? 0,
            weeklyRent: formValues.weeklyRent ?? '',
            numPets: formValues.numberOfPets ?? 0,
            petDeposit: formValues.petsDeposit ?? '',
            moveInDate: formValues.moveInDate
                ? formatDate(
                      new Date(formValues.moveInDate),
                      'YYYY-MM-dd',
                      'en-US'
                  )
                : '',
            housingNotes: formValues.notes ?? '',
        });
    }
}
