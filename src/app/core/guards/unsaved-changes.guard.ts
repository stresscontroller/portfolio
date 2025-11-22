import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { UIState } from '../state';
import { BehaviorSubject } from 'rxjs';

export interface UnsavedComponent {
    hasUnsavedChanges$: BehaviorSubject<boolean>;
}

export const unsavedChangesCanDeactivate: CanDeactivateFn<UnsavedComponent> = (
    component
) => {
    const uiState = inject(UIState);
    if (component.hasUnsavedChanges$.getValue()) {
        return uiState.openUnsavedChangesConfirmationDialog();
    }
    return true;
};
