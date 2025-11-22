import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[appHardcode]',
})
export class HardcodeDirective {
    @Input() set reason(val: string) {
        if (val) {
            // display tooltip containing the reason for why this is hardcoded
            this.el.nativeElement.style.cursor = 'pointer';
            this.el.nativeElement.title = val;
        }
    }

    constructor(private el: ElementRef) {
        // set background color to hot pink so it's obvious that something's not right
        this.el.nativeElement.style.backgroundColor = '#FF69B4';
    }
}
