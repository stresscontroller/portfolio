import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ReactiveFormsModule } from '@angular/forms';
import { PayrollFormState, PayrollState } from '../../state';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { Features } from '@app/core';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-employment',
    templateUrl: './employment.component.html',
    styleUrls: ['./employment.component.scss'],
    imports: [
        CommonModule,
        DropdownModule,
        ReactiveFormsModule,
        InputTextModule,
        CalendarModule,
        CheckboxModule,
        TooltipModule,
        PermissionDirective,
    ],
})
export class EmploymentComponent {
    payrollFormState = inject(PayrollFormState);
    payrollState = inject(PayrollState);
    features = Features;
    locations$ = this.payrollState.locations$;
    payrollForm = this.payrollFormState.payrollForm;
}
