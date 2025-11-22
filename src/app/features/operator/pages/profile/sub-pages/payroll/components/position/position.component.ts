import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule } from '@angular/forms';
import { PayrollState } from '../../state/payroll.state';
import { Department, Features } from '@app/core';
import { PermissionDirective } from '@app/shared';
import { ButtonModule } from 'primeng/button';
import { PayrollFormState } from '../../state';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { map } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-position',
    templateUrl: './position.component.html',
    styleUrls: ['./position.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DropdownModule,
        DividerModule,
        InputNumberModule,
        ButtonModule,
        PermissionDirective,
    ],
})
export class PositionComponent {
    features = Features;
    payrollState = inject(PayrollState);
    payrollFormState = inject(PayrollFormState);
    statuses$ = this.payrollState.statuses$;
    departments$ = this.payrollState.departments$.pipe(
        map((deps) => {
            const flatDep: (Department & { tier: string })[] = [];
            deps.forEach((dep) => {
                flatDep.push({ ...dep, tier: 'first' });
                Object.values(dep.departments).forEach((secondTierDep) => {
                    flatDep.push({ ...secondTierDep, tier: 'second' });
                    Object.values(secondTierDep.departments).forEach(
                        (thirdTierDep) => {
                            flatDep.push({ ...thirdTierDep, tier: 'third' });
                            Object.values(thirdTierDep.departments).forEach(
                                (fourthTierDep) => {
                                    flatDep.push({
                                        ...fourthTierDep,
                                        tier: 'fourth',
                                    });
                                }
                            );
                        }
                    );
                });
            });
            return flatDep;
        })
    );
    positions$ = this.payrollState.positions$;

    positionForm = this.payrollFormState.positionForm;

    addNewPosition(): void {
        this.payrollFormState.addNewPosition();
    }

    removePosition(index: number): void {
        this.positionForm.controls.positions.controls[index]?.value.positionId;
        this.payrollFormState.removePosition(index);
    }
}
