import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserEditState } from './pages/user-edit/state';

@Component({
    standalone: true,
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['../../operator.scss', './user-management.component.scss'],
    imports: [CommonModule, RouterModule],
    providers: [UserEditState],
})
export class UserManagementComponent {}
