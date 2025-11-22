import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Features, UserState, checkPageAccess } from '@app/core';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { TourEditState } from './state';
import { PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-tour-edit',
    templateUrl: './tour-edit.component.html',
    styleUrls: ['./tour-edit.component.scss'],
    imports: [CommonModule, RouterModule, PermissionDirective],
    providers: [TourEditState],
})
export class TourEditComponent {
    features = Features;
    activatedRoute = inject(ActivatedRoute);
    userState = inject(UserState);
    tourEditState = inject(TourEditState);
    tourDetails$ = this.tourEditState.tourDetails$;
    tourEditFeatures = Object.values(Features.toursAndServicesEdit.pages).map(
        (page) => ({
            feature: Features.toursAndServicesEdit.name,
            page: page.name,
        })
    );
    tourEditNavOptions$: Observable<
        {
            displayName: string;
            path: string;
            badge?: number;
        }[]
    > = this.userState.controls$.pipe(
        map((featureControls) => {
            return [
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServicesEdit.name,
                    Features.toursAndServicesEdit.pages.details.name
                )
                    ? [
                          {
                              displayName: 'Details',
                              path: './details',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServicesEdit.name,
                    Features.toursAndServicesEdit.pages.refundPolicy.name
                )
                    ? [
                          {
                              displayName: 'Refund Policy',
                              path: './refund-policy',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServicesEdit.name,
                    Features.toursAndServicesEdit.pages.itinerary.name
                )
                    ? [
                          {
                              displayName: 'Itinerary',
                              path: './itinerary',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServicesEdit.name,
                    Features.toursAndServicesEdit.pages.included.name
                )
                    ? [
                          {
                              displayName: "What's Included",
                              path: './included',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServicesEdit.name,
                    Features.toursAndServicesEdit.pages.price.name
                )
                    ? [
                          {
                              displayName: 'Tour Price',
                              path: './price',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServicesEdit.name,
                    Features.toursAndServicesEdit.pages.gallery.name
                )
                    ? [
                          {
                              displayName: 'Gallery',
                              path: './gallery',
                          },
                      ]
                    : []),
                ...(checkPageAccess(
                    featureControls,
                    Features.toursAndServicesEdit.name,
                    Features.toursAndServicesEdit.pages.video.name
                )
                    ? [
                          {
                              displayName: 'Video',
                              path: './video',
                          },
                      ]
                    : []),
            ];
        })
    );

    private isDestroyed$ = new Subject<void>();

    ngOnInit(): void {
        this.tourEditState.init();
        this.activatedRoute.paramMap
            .pipe(takeUntil(this.isDestroyed$))
            .subscribe((paramMap) => {
                const tourId = paramMap.get('id');
                if (tourId) {
                    this.tourEditState.setTourId(+tourId);
                } else {
                    this.tourEditState.clearTourId();
                }
            });
    }

    ngOnDestroy(): void {
        this.isDestroyed$.next();
        this.isDestroyed$.complete();
    }
}
