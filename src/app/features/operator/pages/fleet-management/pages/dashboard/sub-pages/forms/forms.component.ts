import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { FormsTableComponent } from './components/forms-table/forms-table.component';
import { FormsState } from './state';
@Component({
    standalone: true,
    selector: 'app-forms',
    templateUrl: './forms.component.html',
    styleUrls: ['./forms.component.scss'],
    imports: [
        CommonModule,
        LoaderEmbedComponent,
        PermissionDirective,
        FormsTableComponent,
    ],
    providers: [FormsState],
})
export class FormsComponent {
    formsState = inject(FormsState);

    status$ = this.formsState.status$;
    // formsList$ = this.formsState.formsList$;

    ngOnInit(): void {
        this.formsState.init();
    }

    refresh(): void {
        this.formsState.refresh();
    }
}
