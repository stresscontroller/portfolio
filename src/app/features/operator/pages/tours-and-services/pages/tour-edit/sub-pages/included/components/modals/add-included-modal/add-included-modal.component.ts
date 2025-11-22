import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { TourIncludedState, UIState } from '../../../state';
import {
    Subject,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    standalone: true,
    selector: 'app-add-included-modal',
    templateUrl: './add-included-modal.component.html',
    styleUrls: ['./add-included-modal.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        InputTextModule,
    ],
})
export class AddTourIncludedModalComponent {
    uiState = inject(UIState);
    tourIncludedState = inject(TourIncludedState);

    addTourIncludedForm = new FormGroup({
        description: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    status$ = this.tourIncludedState.status$.pipe(map((status) => status.save));
    addTourIncludedModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.addTourIncluded),
        distinctUntilChanged()
    );
    isOpen$ = this.addTourIncludedModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.addTourIncludedModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    whatsIncluded$ = this.tourIncludedState.whatsIncluded$;
    whatsNotIncluded$ = this.tourIncludedState.whatsNotIncluded$;
    private destroyed$ = new Subject<void>();
    private tourIncludedType: string | undefined = undefined;

    ngOnInit(): void {
        this.isOpen$
            .pipe(
                filter((isOpen) => isOpen),
                takeUntil(this.destroyed$),
                switchMap(() => {
                    return this.context$.pipe(
                        distinctUntilChanged((prev, curr) => {
                            return (
                                JSON.stringify(prev) === JSON.stringify(curr)
                            );
                        }),
                        takeUntil(this.destroyed$)
                    );
                })
            )
            .subscribe((context) => {
                if (context) {
                    this.tourIncludedType = context;
                } else {
                    this.tourIncludedType = undefined;
                }
            });
    }

    clear(): void {
        this.addTourIncludedForm.reset();
    }

    close(): void {
        this.uiState.closeAddTourIncludedModal();
    }

    save(): void {
        if (this.addTourIncludedForm.invalid) {
            Object.values(this.addTourIncludedForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.addTourIncludedForm.getRawValue();
        let whatsIncludedStr =
            this.whatsIncluded$.value
                ?.map((item) => item.description)
                .join(', ') ?? '';
        let whatsNotIncludedStr =
            this.whatsNotIncluded$.value
                ?.map((item) => item.description)
                .join(', ') ?? '';

        if (this.tourIncludedType === 'isIncluded') {
            whatsIncludedStr = whatsIncludedStr + ', ' + formValues.description;
        } else {
            whatsNotIncludedStr =
                whatsNotIncludedStr + ', ' + formValues.description;
        }
        this.tourIncludedState
            .saveTourIncluded(whatsIncludedStr, whatsNotIncludedStr)
            .then(() => {
                this.clear();
                this.close();
                this.tourIncludedState.refresh();
            });
    }
}
