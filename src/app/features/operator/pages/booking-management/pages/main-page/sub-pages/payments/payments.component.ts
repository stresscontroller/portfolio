import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Features } from '@app/core';
import { PaymentsComponent as SharedPaymentsComponent } from '../../../../components';
@Component({
    standalone: true,
    selector: 'app-agent-payments',
    templateUrl: './payments.component.html',
    imports: [CommonModule, SharedPaymentsComponent],
})
export class PaymentsComponent {
    features = Features;
}
