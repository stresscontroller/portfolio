import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, distinctUntilChanged, filter } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TourIncludedItem } from '@app/core';
import { TourIncludedState, UIState } from '../../../state';

@Component({
    standalone: true,
    selector: 'app-remove-included-modal',
    templateUrl: './remove-included-modal.component.html',
    styleUrls: ['./remove-included-modal.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RemoveTourIncludedModalComponent {
    uiState = inject(UIState);
    tourIncludedState = inject(TourIncludedState);
    removeTrainingModal$ = this.uiState.modals$.pipe(
        map((modals) => modals.deleteTourIncluded),
        distinctUntilChanged()
    );

    isOpen$ = this.removeTrainingModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.removeTrainingModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    appliedFilters$ = this.removeTrainingModal$.pipe(
        map((data) => data.context)
    );
    status$ = this.tourIncludedState.status$.pipe(map((status) => status.save));

    whatsIncluded$ = this.tourIncludedState.whatsIncluded$;
    whatsNotIncluded$ = this.tourIncludedState.whatsNotIncluded$;

    close(): void {
        this.uiState.closeRemoveTourIncludedModal();
    }

    delete(context: TourIncludedItem): void {
        const whatsIncludedArr = this.whatsIncluded$.getValue();
        const whatsNotIncludedArr = this.whatsNotIncluded$.getValue();
        let whatsIncludedStr: string = '';
        let whatsNotIncludedStr: string = '';
        if (context.type === 'isIncluded') {
            if (whatsIncludedArr) {
                const updatedArray = whatsIncludedArr.filter(
                    (item) => item.index !== context.index
                );
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
                const updatedArray = whatsNotIncludedArr.filter(
                    (item) => item.index !== context.index
                );
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
                this.close();
                this.tourIncludedState.refresh();
            });
    }
}
