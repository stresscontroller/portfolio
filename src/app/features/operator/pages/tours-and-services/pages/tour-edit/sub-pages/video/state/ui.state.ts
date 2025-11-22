import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UIState {
    modals$ = new BehaviorSubject<{
        deleteVideo: {
            isOpen: boolean;
            context?: {
                videoId: number;
            };
        };
    }>({
        deleteVideo: {
            isOpen: false,
        },
    });

    openRemoveTourVideoModal(videoId: number): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteVideo: {
                isOpen: true,
                context: {
                    videoId,
                },
            },
        });
    }

    closeRemoveTourVideoModal(): void {
        this.modals$.next({
            ...this.modals$.value,
            deleteVideo: {
                isOpen: false,
            },
        });
    }
}
