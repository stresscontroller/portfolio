import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    animate,
    animateChild,
    query,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { BehaviorSubject } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { isMobile, UIStatus } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-camera',
    templateUrl: './camera.component.html',
    styleUrls: ['./camera.component.scss'],
    imports: [CommonModule, FormsModule, ButtonModule],
    animations: [
        trigger('container', [
            transition(':enter, :leave', [
                query('@*', animateChild(), { optional: true }),
            ]),
        ]),
        trigger('fadeSlideInOut', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(80px)' }),
                animate(
                    '250ms ease-in-out',
                    style({ opacity: 1, transform: 'translateY(0)' })
                ),
            ]),
            transition(':leave', [
                animate(
                    '250ms ease-in-out',
                    style({ opacity: 0, transform: 'translateY(80px)' })
                ),
            ]),
        ]),
    ],
})
export class CameraComponent {
    @ViewChild('videoFeed') videoFeed: ElementRef | undefined;
    @ViewChild('previewCanvas') previewCanvas: ElementRef | undefined;
    @Input() uploadStatus: UIStatus = 'idle';
    @Output() upload = new EventEmitter<File | undefined>();

    cameraAttr$ = new BehaviorSubject<{ width: number; height: number }>({
        width: 0, // we will scale the photo width to this
        height: window.innerHeight, // this.document.documentElement.clientHeight, // this will be computed based on the input stream
    });
    capturedPhoto$ = new BehaviorSubject<{
        src: string;
    } | null>(null);

    private isStreaming = false;
    private stream: MediaStream | undefined;

    videoEventListener = () => {
        if (this.videoFeed) {
            const video = this.videoFeed?.nativeElement as HTMLVideoElement;
            if (!this.isStreaming) {
                let width = this.cameraAttr$.getValue().width;
                const height = this.cameraAttr$.getValue().height;
                width = (video.videoWidth / video.videoHeight) * height;

                // Firefox currently has a bug where the height can't be read from
                // the video, so we will make assumptions if this happens.
                if (isNaN(height)) {
                    width = height / (4 / 3);
                }

                this.isStreaming = true;
                this.cameraAttr$.next({
                    width,
                    height,
                });
            }
        }
    };

    ngAfterViewInit(): void {
        this.setup();
    }

    ngOnDestroy(): void {
        if (this.videoFeed) {
            const video = this.videoFeed?.nativeElement as HTMLVideoElement;
            if (video) {
                video.removeEventListener('canplay', this.videoEventListener);
            }
        }
        this.stopCamera();
        this.capturedPhoto$.next(null);
        this.isStreaming = false;
    }

    setup(): void {
        if (this.videoFeed) {
            const video = this.videoFeed?.nativeElement as HTMLVideoElement;
            video.addEventListener('canplay', this.videoEventListener, false);
            navigator.mediaDevices
                .getUserMedia({
                    video: isMobile()
                        ? {
                              facingMode: {
                                  exact: 'environment',
                              },
                          }
                        : true,
                    audio: false,
                })
                .then((mediaStream) => {
                    this.stream = mediaStream;
                    if (this.videoFeed) {
                        const video = this.videoFeed
                            ?.nativeElement as HTMLVideoElement;
                        video.srcObject = mediaStream;
                        video.play();
                    }
                })
                .catch(() => {
                    // swallow error
                });
        }
    }

    // Capture a photo by fetching the current contents of the video
    // and drawing it into a canvas, then converting that to a PNG
    // format data URL. By drawing it on an offscreen canvas and then
    // drawing that to the screen, we can change its size and/or apply
    // other changes before drawing it.

    capture(): void {
        if (this.previewCanvas) {
            const canvas = this.previewCanvas
                .nativeElement as HTMLCanvasElement;
            const context = canvas.getContext('2d');
            const { height, width } = this.cameraAttr$.getValue();
            if (context && height && width) {
                canvas.height = height;
                canvas.width = width;
                context.drawImage(
                    this.videoFeed?.nativeElement,
                    0,
                    0,
                    width,
                    height
                );

                const imgSrc = canvas.toDataURL('image/jpeg');

                this.capturedPhoto$.next({ src: imgSrc });
            } else {
                if (context) {
                    context.fillStyle = '#AAA';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                }

                const imgSrc = canvas.toDataURL('image/jpeg');
                this.capturedPhoto$.next({ src: imgSrc });
            }
        }
        this.stopCamera();
    }

    stopCamera(): void {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => {
                if (track.readyState == 'live') {
                    track.stop();
                }
            });
        }
    }

    uploadPhoto(): void {
        if (this.previewCanvas) {
            const canvas = this.previewCanvas
                .nativeElement as HTMLCanvasElement;
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const imgFile = new File(
                            [blob],
                            `${new Date().getTime()}.jpeg`,
                            { type: 'image/jpeg' }
                        );
                        this.upload.emit(imgFile);
                    } else {
                        this.upload.emit(undefined);
                    }
                },
                'image/jpeg',
                0.7
            );
        }
    }

    reset() {
        this.capturedPhoto$.next(null);
        this.isStreaming = false;
        this.setup();
    }
}
