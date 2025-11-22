import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

import { ButtonModule } from 'primeng/button';

import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-job-applicants',
    templateUrl: './job-applicants.component.html',
    styleUrls: ['./job-applicants.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
})
export class JobApplicantsComponent {
    private destroyed$ = new Subject<void>();

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
