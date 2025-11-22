import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-icon-transport',
    template: `
        <svg
            [attr.width]="width"
            [attr.height]="height"
            viewBox="0 0 11 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M6.1875 7.875C6.1875 7.35938 5.76562 6.9375 5.25 6.9375C4.71094 6.9375 4.3125 7.35938 4.3125 7.875C4.3125 8.41406 4.71094 8.8125 5.25 8.8125C5.76562 8.8125 6.1875 8.41406 6.1875 7.875ZM10.5 2.57812C10.5 1.07812 8.83594 0 7.24219 0H3.23438C1.66406 0 0 1.07812 0 2.57812V7.94531C0 9.09375 1.00781 10.0547 2.32031 10.3828L0.9375 11.7656C0.84375 11.8594 0.914062 12 1.03125 12H2.15625C2.25 12 2.32031 11.9766 2.36719 11.9297L3.77344 10.5H6.70312L8.10938 11.9297C8.15625 11.9766 8.22656 12 8.32031 12H9.44531C9.5625 12 9.63281 11.8594 9.53906 11.7656L8.15625 10.3828C9.46875 10.0547 10.5 9.09375 10.5 7.94531V2.57812ZM1.125 5.25V3.375H9.375V5.25H1.125ZM1.17188 2.25C1.42969 1.64062 2.32031 1.125 3.23438 1.125H7.24219C8.17969 1.125 9.07031 1.64062 9.30469 2.25H1.17188ZM9.375 7.94531C9.375 8.78906 8.13281 9.375 7.24219 9.375H3.23438C2.32031 9.375 1.125 8.78906 1.125 7.94531V6.375H9.375V7.94531Z"
                [attr.fill]="color"
            />
        </svg>
    `,
    imports: [CommonModule],
})
export class IconTransportComponent {
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
