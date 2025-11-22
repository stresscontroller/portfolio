import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FeedbackService {
    audios: Record<
        string,
        {
            path: string;
            audio?: HTMLAudioElement;
        }
    > = {
        beep: {
            path: '/assets/audio/beep.mp3',
        },
    };

    constructor() {
        Object.entries(this.audios).forEach(([key, val]) => {
            const audioElement = new Audio(val.path);
            audioElement.preload = 'auto';
            this.audios[key] = {
                ...val,
                audio: audioElement,
            };
        });
    }
    vibrate(): boolean {
        try {
            return window.navigator.vibrate(200);
        } catch (error) {
            return false;
        }
    }

    playSoundEffect(name: string): void {
        if (name in this.audios) {
            try {
                const audioElement = this.audios[name].audio;
                if (audioElement) {
                    audioElement.play();
                }
            } catch (error) {
                // do nothing
            }
        }
    }
}
