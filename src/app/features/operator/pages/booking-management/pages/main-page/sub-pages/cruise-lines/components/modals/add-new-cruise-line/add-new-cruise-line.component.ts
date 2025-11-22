import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormControl,
    FormGroup,
    FormsModule,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { map, distinctUntilChanged, BehaviorSubject } from 'rxjs';

import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { CruiseLineConfig, UIStatus } from '@app/core';
import { CruiseLinesState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-add-new-cruise-line-modal',
    templateUrl: './add-new-cruise-line.component.html',
    styleUrls: ['./add-new-cruise-line.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        InputTextModule,
    ],
})
export class AddNewCruiseLineModalComponent {
    uiState = inject(UIState);
    cruiseLinesState = inject(CruiseLinesState);
    addCruiseLine$ = this.uiState.modals$.pipe(
        map((modals) => modals.addCruiseLine),
        distinctUntilChanged()
    );

    isOpen$ = this.addCruiseLine$.pipe(map((modal) => modal.isOpen));
    status$ = new BehaviorSubject<UIStatus>('idle');
    selectedFile: (File & { imgSrc?: string }) | undefined = undefined;

    addCruiseLineForm = new FormGroup({
        shipCompanyName: new FormControl<string | null>(null, {
            validators: [Validators.required],
            nonNullable: true,
        }),
    });

    close() {
        this.reset();
        this.uiState.closeAddNewCruiseLineModal();
    }

    reset(): void {
        this.status$.next('idle');
        this.selectedFile = undefined;
    }

    add(): void {
        if (!this.selectedFile) {
            return;
        }
        this.status$.next('loading');
        const formattedFile = this.selectedFile;
        const formValues = this.addCruiseLineForm.getRawValue();
        const config: CruiseLineConfig = {
            shipCompanyId: 0,
            shipCompanyName: formValues.shipCompanyName ?? '',
        };
        this.cruiseLinesState
            .saveCruiseLine(config, formattedFile)
            .then(() => {
                this.status$.next('success');
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }

    onImageSelect(event: Event): void {
        const file = (<HTMLInputElement>event.target).files?.[0];
        if (!file) {
            this.selectedFile = undefined;
            return;
        }
        this.selectedFile = file;
        this.selectedFile.imgSrc = URL.createObjectURL(file);
    }
}
