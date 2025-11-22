import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type CreditCardType =
    | 'visa'
    | 'amex'
    | 'mastercard'
    | 'discover'
    | 'dinersclub'
    | 'jcb'
    | 'invoicelater';

@Component({
    standalone: true,
    selector: 'app-cc-identification',
    templateUrl: './cc-identification.component.html',
    styleUrls: ['./cc-identification.component.scss'],
    imports: [CommonModule],
})
export class CcIdentificationComponent {
    @Input() cardType: CreditCardType | string | null | undefined;
}
