import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import {
    FileUploadModule,
    FileUpload,
    FileSelectEvent,
} from 'primeng/fileupload';
import { BehaviorSubject, map } from 'rxjs';
import { Features, UIStatus } from '@app/core';
import { UIState, TourVideoState } from './state';
import { RemoveTourVideoModalComponent } from './components';
import { PermissionDirective } from '@app/shared';
@Component({
    standalone: true,
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        FileUploadModule,
        DividerModule,
        RemoveTourVideoModalComponent,
        PermissionDirective,
    ],
    providers: [UIState, TourVideoState],
})
export class VideoComponent {
    @ViewChild('videoUploadComponent', { static: false })
    videoUploadComponent: FileUpload | undefined;
    uiState = inject(UIState);
    tourVideoState = inject(TourVideoState);

    features = Features;

    videoToUpload: File | undefined;
    status$ = new BehaviorSubject<UIStatus>('idle');
    tourDetails$ = this.tourVideoState.tourDetails$;
    video$ = this.tourDetails$.pipe(
        map((tourDetails) => tourDetails?.tourVideo?.videoPath)
    );

    onVideoSelect(event: FileSelectEvent): void {
        const selectedFile = event.files[0];
        if (selectedFile) {
            this.videoToUpload = selectedFile;
        }
    }

    clear(): void {
        this.status$.next('idle');
        if (this.videoUploadComponent) {
            this.videoUploadComponent.clear();
        }
        this.videoToUpload = undefined;
    }

    openRemoveTourVideoModal(): void {
        const videoId = this.tourDetails$.getValue()?.tourVideo?.id;
        if (!videoId) {
            return;
        }
        this.uiState.openRemoveTourVideoModal(videoId);
    }

    save(): void {
        if (!this.videoToUpload) {
            return;
        }
        this.status$.next('loading');
        this.tourVideoState
            .updateTourVideo(this.videoToUpload)
            .then(() => {
                this.clear();
            })
            .catch(() => {
                this.status$.next('error');
            });
    }
}
