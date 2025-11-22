import { Route } from '@angular/router';
import { Features, featureGuardCanActivate } from '@app/core';

export const TOUR_EDIT_ROUTES: Route[] = [
    {
        path: '',
        loadComponent: () =>
            import('./tour-edit.component').then((c) => c.TourEditComponent),
        children: [
            {
                path: '',
                redirectTo: 'details',
                pathMatch: 'full',
            },
            {
                path: 'details',
                loadComponent: () =>
                    import('./sub-pages/details/details.component').then(
                        (c) => c.DetailsComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServicesEdit.name,
                    pages: [Features.toursAndServicesEdit.pages.details.name],
                },
            },
            {
                path: 'refund-policy',
                loadComponent: () =>
                    import(
                        './sub-pages/refund-policy/refund-policy.component'
                    ).then((c) => c.RefundPolicyComponent),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServicesEdit.name,
                    pages: [
                        Features.toursAndServicesEdit.pages.refundPolicy.name,
                    ],
                },
            },
            {
                path: 'itinerary',
                loadComponent: () =>
                    import('./sub-pages/itinerary/itinerary.component').then(
                        (c) => c.ItineraryComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServicesEdit.name,
                    pages: [Features.toursAndServicesEdit.pages.itinerary.name],
                },
            },
            {
                path: 'included',
                loadComponent: () =>
                    import('./sub-pages/included/included.component').then(
                        (c) => c.IncludedComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServicesEdit.name,
                    pages: [Features.toursAndServicesEdit.pages.included.name],
                },
            },
            {
                path: 'price',
                loadComponent: () =>
                    import('./sub-pages/price/price.component').then(
                        (c) => c.PriceComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServicesEdit.name,
                    pages: [Features.toursAndServicesEdit.pages.price.name],
                },
            },
            {
                path: 'gallery',
                loadComponent: () =>
                    import('./sub-pages/gallery/gallery.component').then(
                        (c) => c.GalleryComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServicesEdit.name,
                    pages: [Features.toursAndServicesEdit.pages.gallery.name],
                },
            },
            {
                path: 'video',
                loadComponent: () =>
                    import('./sub-pages/video/video.component').then(
                        (c) => c.VideoComponent
                    ),
                canActivate: [featureGuardCanActivate],
                data: {
                    feature: Features.toursAndServicesEdit.name,
                    pages: [Features.toursAndServicesEdit.pages.video.name],
                },
            },
            {
                path: '**',
                redirectTo: 'details',
            },
        ],
    },
];
