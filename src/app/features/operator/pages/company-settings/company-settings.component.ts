import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-company-settings',
    templateUrl: './company-settings.component.html',
    styleUrls: ['../../operator.scss', './company-settings.component.scss'],
    imports: [CommonModule, RouterModule],
})
export class CompanySettingsComponent {}
