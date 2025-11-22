import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-icon-cruise',
    template: `
        <svg
            [attr.width]="width"
            [attr.height]="height"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M20.637 22.9624L22.6074 17.5422C22.7049 17.2743 22.7005 16.9798 22.5951 16.7149C22.4896 16.45 22.2905 16.2331 22.0355 16.1054L13.0191 11.5972C12.8578 11.5166 12.6799 11.4746 12.4995 11.4746C12.3191 11.4746 12.1412 11.5166 11.9799 11.5972L2.96352 16.1054C2.70845 16.233 2.50919 16.4498 2.40362 16.7148C2.29805 16.9797 2.29356 17.2742 2.39099 17.5422L4.36201 22.9624"
                [attr.stroke]="color"
                stroke-width="1.8"
                stroke-linejoin="round"
            />
            <path
                d="M15.4068 6.6875V2.0375C15.4068 1.72919 15.2844 1.4335 15.0663 1.21549C14.8483 0.997477 14.5526 0.875 14.2443 0.875H10.7568C10.4485 0.875 10.1528 0.997477 9.93482 1.21549C9.71681 1.4335 9.59434 1.72919 9.59434 2.0375V6.6875M18.8943 6.6875H6.10684C5.79852 6.6875 5.50284 6.80998 5.28482 7.02799C5.06681 7.246 4.94434 7.54169 4.94434 7.85V14.825L12.0135 11.5624C12.1662 11.492 12.3324 11.4555 12.5006 11.4555C12.6688 11.4555 12.835 11.492 12.9877 11.5624L20.0568 14.825V7.85C20.0568 7.54169 19.9344 7.246 19.7163 7.02799C19.4983 6.80998 19.2026 6.6875 18.8943 6.6875Z"
                [attr.stroke]="color"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
            <path
                d="M12.5 17.1499V21.7999"
                [attr.stroke]="color"
                stroke-width="1.8"
                stroke-linecap="round"
            />
            <path
                d="M0.875 24.1249C3.2 24.1249 3.2 22.9624 4.94375 22.9624C6.6875 22.9624 6.6875 24.1249 8.43125 24.1249C10.175 24.1249 10.4656 22.9624 12.5 22.9624C14.5344 22.9624 14.825 24.1249 16.5688 24.1249C18.3125 24.1249 18.3125 22.9624 20.0563 22.9624C21.8 22.9624 21.8 24.1249 24.125 24.1249"
                [attr.stroke]="color"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    `,
    imports: [CommonModule],
})
export class IconCruiseComponent {
    @Input() width: number = 25;
    @Input() height: number = 25;
    @Input() color: string = '#053654';

    @HostBinding('style.height') hostHeight = `${this.height}px`;
    @HostBinding('style.width') hostWidth = `${this.width}px`;

    ngOnChanges() {
        this.hostHeight = `${this.height}px`;
        this.hostWidth = `${this.width}px`;
    }
}
