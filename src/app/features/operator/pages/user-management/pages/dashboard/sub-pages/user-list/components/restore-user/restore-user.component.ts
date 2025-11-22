import { Component, inject } from '@angular/core';
import { UserListState } from '../../user-list.state';
import { map, distinctUntilChanged, filter, BehaviorSubject } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { UIStatus } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-restore-user-modal',
    templateUrl: './restore-user.component.html',
    styleUrls: ['./restore-user.component.scss'],
    imports: [CommonModule, DialogModule, DividerModule, ButtonModule],
})
export class RestoreUserModalComponent {
    userListState = inject(UserListState);

    restoreUserModal$ = this.userListState.modals$.pipe(
        map((modals) => modals.restoreUser),
        distinctUntilChanged()
    );

    isOpen$ = this.restoreUserModal$.pipe(map((modal) => modal.isOpen));
    context$ = this.restoreUserModal$.pipe(
        filter((modal) => modal.isOpen),
        map((modal) => modal.context)
    );
    status$ = new BehaviorSubject<UIStatus>('idle');

    close(): void {
        this.status$.next('idle');
        this.userListState.closeRestoreUserModal();
    }

    restore(config: string): void {
        this.status$.next('loading');
        this.userListState
            .restoreUser(config)
            .then(() => {
                this.userListState.refresh();
                this.close();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
