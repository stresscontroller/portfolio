import { Component, inject } from '@angular/core';
import { UserListState } from '../../user-list.state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { UIStatus, UserListItem } from '@app/core';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-remove-user-modal',
    templateUrl: './remove-user.component.html',
    styleUrls: ['./remove-user.component.scss'],
    imports: [
        CommonModule,
        DialogModule,
        DividerModule,
        ButtonModule,
        RadioButtonModule,
        FormsModule,
    ],
})
export class RemoveUserModalComponent {
    userListState = inject(UserListState);
    isEligibleForRehire!: string;

    deleteUserModal$ = this.userListState.modals$.pipe(
        map((modals) => modals.deleteUser),
        distinctUntilChanged()
    );

    isOpen$ = this.deleteUserModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.deleteUserModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    isEmployee$ = this.deleteUserModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.isEmployee)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    close(): void {
        this.status$.next('idle');
        this.isEligibleForRehire = '';
        this.userListState.closeDeleteUserModal();
    }

    delete(config: UserListItem): void {
        this.status$.next('loading');
        const eligible =
            this.isEligibleForRehire == 'isEligible' ? true : false;
        this.userListState
            .deleteUser(config.userId, eligible)
            .then(() => {
                this.userListState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
