import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserListState } from './user-list.state';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { Features, UserListItem } from '@app/core';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import {
    AddNewUserComponent,
    RemoveUserModalComponent,
    RestoreUserModalComponent,
} from './components';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { FilterService } from 'primeng/api';

@Component({
    standalone: true,
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        TableModule,
        InputSwitchModule,
        InputTextModule,
        ButtonModule,
        DividerModule,
        LoaderEmbedComponent,
        AddNewUserComponent,
        RemoveUserModalComponent,
        RestoreUserModalComponent,
        PermissionDirective,
    ],
    providers: [UserListState],
})
export class UserListComponent {
    filterService = inject(FilterService);

    features = Features;
    editUserFeatures = Object.values(Features.userManagementEdit.pages).map(
        (page) => ({
            feature: Features.userManagementEdit.name,
            page: page.name,
        })
    );
    displayActionColumn = [
        ...this.editUserFeatures,

        {
            feature: Features.userManagement.name,
            page: Features.userManagement.pages.userList.name,
            pageFeature: [
                Features.userManagement.pages.userList.features.userDelete.name,
            ],
        },
    ];
    userListState = inject(UserListState);
    users$ = this.userListState.users$.pipe(
        switchMap((users) => {
            return this.keyword$.pipe(
                map((searchString) => {
                    if (!users || users.length === 0) {
                        return [];
                    }
                    if (!searchString) {
                        return users;
                    }
                    return this.filterService.filter(
                        users,
                        ['userName', 'userRole', 'firstName', 'lastName'],
                        searchString,
                        'contains'
                    );
                })
            );
        })
    );
    status$ = this.userListState.status$;
    showInactive = false;
    keyword: string = '';
    keyword$ = new BehaviorSubject<string>('');

    ngOnInit(): void {
        this.userListState.init();
    }

    search(): void {
        this.keyword$.next(this.keyword);
    }

    showInactiveChange(): void {
        this.userListState.setFilter(this.showInactive);
    }

    openAddNewUserModal(): void {
        this.userListState.openAddNewUserModal();
    }

    openDeleteUserModal(config: UserListItem): void {
        this.userListState.openDeleteUserModal(config);
    }

    openRestoreUserModal(config: UserListItem): void {
        this.userListState.openRestoreUserModal(config);
    }
}
