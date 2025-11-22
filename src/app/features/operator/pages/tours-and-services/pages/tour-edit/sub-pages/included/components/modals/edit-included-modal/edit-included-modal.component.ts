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
    distinctUntilChanged,
    filter,
    map,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-edit-included-modal',
    templateUrl: './edit-included-modal.component.html',
    styleUrls: ['./edit-included-modal.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        InputTextModule,
    ],
})
export class EditTourIncludedModalComponent {
    uiState = inject(UIState);
    tourIncludedState = inject(TourIncludedState);

    editTourIncludedForm = new FormGroup({
        description: new FormControl<string | null>(null, {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    editTourIncludedModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.editTourIncluded),
        distinctUntilChanged()
    );
    isOpen$ = this.editTourIncludedModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.editTourIncludedModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = this.tourIncludedState.status$.pipe(map((status) => status.save));

    whatsIncluded$ = this.tourIncludedState.whatsIncluded$;
    whatsNotIncluded$ = this.tourIncludedState.whatsNotIncluded$;

    private destroyed$ = new Subject<void>();
    private tourIncludedIndex: number | undefined = undefined;
    private tourIncludedType: string | undefined = undefined;

    ngOnInit(): void {
        this.setupForm();
    }

    clear(): void {
        this.editTourIncludedForm.reset();
    }

    close(): void {
        this.uiState.closeEditTourIncludedModal();
    }

    private async setupForm() {
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
                    this.tourIncludedIndex = context.index;
                    this.tourIncludedType = context.type;
                    this.editTourIncludedForm.patchValue({
                        description: context.description,
                    });
                } else {
                    this.editTourIncludedForm.reset();
                    this.tourIncludedIndex = undefined;
                    this.tourIncludedType = undefined;
                }
            });
    }

    save(): void {
        if (this.editTourIncludedForm.invalid) {
            Object.values(this.editTourIncludedForm.controls).forEach(
                (control) => {
                    control.markAsDirty();
                    control.markAsTouched();
                }
            );
            return;
        }
        const formValues = this.editTourIncludedForm.getRawValue();

        const whatsIncludedArr = this.whatsIncluded$.value;
        const whatsNotIncludedArr = this.whatsNotIncluded$.value;
        let whatsIncludedStr: string = '';
        let whatsNotIncludedStr: string = '';
        if (this.tourIncludedType === 'isIncluded') {
            if (whatsIncludedArr) {
                const updatedItem = {
                    ...whatsIncludedArr[this.tourIncludedIndex ?? 0],
                    description: formValues.description ?? '',
                    type: 'isIncluded',
                };
                const updatedArray = [...whatsIncludedArr];
                updatedArray[this.tourIncludedIndex ?? 0] = updatedItem;
                whatsIncludedStr =
                    updatedArray.map((item) => item.description).join(', ') ??
                    '';
                whatsNotIncludedStr =
                    whatsNotIncludedArr
                        ?.map((item) => item.description)
                        .join(', ') ?? '';
            }
        } else {
            if (whatsNotIncludedArr) {
                const updatedItem = {
                    ...whatsNotIncludedArr[this.tourIncludedIndex ?? 0],
                    description: formValues.description ?? '',
                    type: 'notIncluded',
                };
                const updatedArray = [...whatsNotIncludedArr];
                updatedArray[this.tourIncludedIndex ?? 0] = updatedItem;
                whatsIncludedStr =
                    whatsIncludedArr
                        ?.map((item) => item.description)
                        .join(', ') ?? '';
                whatsNotIncludedStr =
                    updatedArray.map((item) => item.description).join(', ') ??
                    '';
            }
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
