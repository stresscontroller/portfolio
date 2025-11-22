import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EmploymentComponent, PositionComponent } from './components';
import { PayrollFormState, PayrollState } from './state';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';
import { Features } from '@app/core';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-payroll',
    templateUrl: './payroll.component.html',
    styleUrls: ['./payroll.component.scss'],
    imports: [
        CommonModule,
        PermissionDirective,
        LoaderEmbedComponent,
        PositionComponent,
        ButtonModule,
        EmploymentComponent,
    ],
    providers: [PayrollState, PayrollFormState],
})
export class PayrollComponent {
    features = Features;
    payrollState = inject(PayrollState);
    payrollFormState = inject(PayrollFormState);

    status$ = this.payrollState.statuses$;

    ngOnInit(): void {
        this.payrollFormState.initPayrollForm();
        this.payrollState.init();
    }

    save(): void {
        this.payrollFormState.save();
    }
}
