import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    pure: true,
    standalone: true,
    name: 'participants',
})
export class ParticipantsPipe implements PipeTransform {
    transform(
        adultsCount?: number | undefined | null,
        childrenCount?: number | undefined | null,
        infantsCount?: number | undefined | null
    ): string {
        const participants = [];
        if (adultsCount && adultsCount > 0) {
            if (adultsCount === 1) {
                participants.push(`${adultsCount} Adult`);
            } else {
                participants.push(`${adultsCount} Adults`);
            }
        }
        if (childrenCount && childrenCount > 0) {
            if (childrenCount === 1) {
                participants.push(`${childrenCount} Child`);
            } else {
                participants.push(`${childrenCount} Children`);
            }
        }
        if (infantsCount && infantsCount > 0) {
            if (infantsCount === 1) {
                participants.push(`${infantsCount} Infant`);
            } else {
                participants.push(`${infantsCount} Infants`);
            }
        }
        if (participants.length > 0) {
            return participants.join(', ');
        }
        return 'No participants added';
    }
}
