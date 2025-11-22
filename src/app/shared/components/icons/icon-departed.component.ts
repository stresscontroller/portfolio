import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-icon-departed',
    template: `
        <svg
            [attr.width]="width"
            [attr.height]="height"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clip-path="url(#clip0_50_322)">
                <path
                    d="M14.0378 4.53L12.6678 4.09C12.5757 4.06128 12.4769 4.06224 12.3854 4.09275C12.2938 4.12326 12.2142 4.18177 12.1578 4.26L11.2178 5.75L6.05778 3.18C5.65091 2.9414 5.19686 2.79451 4.72733 2.74959C4.25781 2.70467 3.78413 2.76281 3.33941 2.91994C2.89468 3.07707 2.48962 3.3294 2.15253 3.65932C1.81544 3.98923 1.55445 4.38876 1.38778 4.83C1.31901 5.05279 1.34147 5.29375 1.45021 5.49999C1.55896 5.70624 1.74511 5.86089 1.96778 5.93L5.35778 7.03L5.69778 7.14L6.33778 9.33C6.35723 9.40566 6.39604 9.47495 6.4504 9.53106C6.50475 9.58717 6.57278 9.62816 6.64778 9.65L8.18778 10.15C8.2686 10.1849 8.35746 10.1969 8.44465 10.1848C8.53184 10.1726 8.614 10.1366 8.68214 10.0809C8.75027 10.0251 8.80177 9.95172 8.83098 9.86867C8.8602 9.78562 8.86601 9.69613 8.84778 9.61L8.52778 8.05L8.74778 8.12L12.0578 9.19C12.1647 9.22967 12.2785 9.24767 12.3925 9.24294C12.5065 9.23821 12.6184 9.21085 12.7217 9.16246C12.825 9.11406 12.9176 9.0456 12.9942 8.96105C13.0708 8.87651 13.1298 8.77757 13.1678 8.67L14.3278 5.07C14.3592 4.95996 14.3464 4.84201 14.2923 4.7412C14.2381 4.64039 14.1468 4.56463 14.0378 4.53V4.53Z"
                    [attr.stroke]="color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M1.34766 14.25H14.3477"
                    [attr.stroke]="color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </g>
            <defs>
                <clipPath id="clip0_50_322">
                    <rect
                        width="14"
                        height="14"
                        fill="white"
                        transform="translate(0.847656 0.75)"
                    />
                </clipPath>
            </defs>
        </svg>
    `,
    imports: [CommonModule],
})
export class IconDepartedComponent {
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
