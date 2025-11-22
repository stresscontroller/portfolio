import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
    standalone: true,
    selector: 'app-credit-card-icons',
    templateUrl: './credit-card-icons.component.html',
    styleUrls: ['./credit-card-icons.component.scss'],
    imports: [CommonModule],
})
export class CreditCardIconsComponent {
    icons = [
        '/assets/icons/ic_visa.svg',
        '/assets/icons/ic_mastercard.svg',
        '/assets/icons/ic_amex.svg',
        '/assets/icons/ic_discover.svg',
        '/assets/icons/ic_diners_club.svg',
        '/assets/icons/ic_jcb.svg',
    ];
}
