import { Directive, ElementRef, Input, inject } from '@angular/core';
import { BehaviorSubject, Subject, filter, map, switchMap } from 'rxjs';
import { UserState } from '@app/core';

export interface PermissionConfig {
    features: {
        feature: string;
        page?: string;
        pageFeature?: string | string[];
        pageFeatureCheck?: 'and' | 'or' | 'atleastOne';
    }[];
    featureCheck?: 'and' | 'or' | 'atleastOne';
    mode?:
        | 'disabled'
        | 'hidden'
        | 'none'
        | 'childDisabled'
        | 'disabledNoStyling';
}

@Directive({
    standalone: true,
    selector: '[appPermission]',
})
export class PermissionDirective {
    @Input() set appPermission(permissionConfig: PermissionConfig) {
        this.permissionConfig$.next(permissionConfig);
    }

    permissionConfig$ = new BehaviorSubject<PermissionConfig | undefined>(
        undefined
    );

    userState = inject(UserState);
    private _destroy$ = new Subject();
    constructor(private el: ElementRef) {}

    ngOnInit(): void {
        this.userState.controls$
            .pipe(
                filter((control) => !!control),
                switchMap((featureControl) => {
                    return this.permissionConfig$.pipe(
                        map((permissionConfig) => {
                            return {
                                permissionConfig,
                                featureControl,
                            };
                        })
                    );
                })
            )
            .subscribe((conf) => {
                const featureControl = conf.featureControl;
                let hasAccess = false;
                if (featureControl && conf.permissionConfig?.features) {
                    const features = conf.permissionConfig.features;
                    const featuresWithAccess = features.filter((feature) => {
                        if (
                            featureControl &&
                            feature.feature in featureControl
                        ) {
                            const featureDetail =
                                featureControl[feature.feature];
                            if (
                                featureDetail.isActive === true &&
                                !feature.page
                            ) {
                                return true;
                            }

                            if (
                                featureDetail.isActive === true &&
                                feature.page
                            ) {
                                if (
                                    feature.page in featureDetail.pages &&
                                    featureDetail.pages[feature.page]
                                        .isActive === true
                                ) {
                                    const featurePageDetail =
                                        featureDetail.pages[feature.page];

                                    if (!feature.pageFeature) {
                                        return true;
                                    }

                                    if (
                                        featurePageDetail.isActive === true &&
                                        feature.pageFeature
                                    ) {
                                        const pageFeatures = Array.isArray(
                                            feature.pageFeature
                                        )
                                            ? feature.pageFeature
                                            : [feature.pageFeature];
                                        const pageFeaturesWithAccess =
                                            pageFeatures.filter(
                                                (pageFeature) => {
                                                    return (
                                                        pageFeature in
                                                            featurePageDetail.pageFeatures &&
                                                        featurePageDetail
                                                            .pageFeatures[
                                                            pageFeature
                                                        ].isActive === true
                                                    );
                                                }
                                            );
                                        if (feature.pageFeatureCheck === 'or') {
                                            return (
                                                pageFeaturesWithAccess.length >
                                                0
                                            );
                                        } else if (
                                            feature.pageFeatureCheck ===
                                            'atleastOne'
                                        ) {
                                            return (
                                                pageFeaturesWithAccess.length >
                                                1
                                            );
                                        } else {
                                            return (
                                                pageFeaturesWithAccess.length ===
                                                pageFeatures.length
                                            );
                                        }
                                    }
                                }
                            }
                        }
                        return false;
                    });
                    if (conf.permissionConfig.featureCheck === 'or') {
                        hasAccess = featuresWithAccess.length > 0;
                    } else if (
                        conf.permissionConfig.featureCheck === 'atleastOne'
                    ) {
                        hasAccess = featuresWithAccess.length > 1;
                    } else {
                        hasAccess =
                            conf.permissionConfig.features.length ===
                            featuresWithAccess.length;
                    }
                }

                if (!hasAccess) {
                    if (!conf.permissionConfig?.mode) {
                        this.el.nativeElement.style.display = 'none';
                    } else if (conf.permissionConfig.mode === 'disabled') {
                        this.el.nativeElement.disabled = true;
                        this.el.nativeElement.style['pointer-events'] = 'none';
                        this.el.nativeElement.classList.add('p-disabled');
                    } else if (
                        conf.permissionConfig.mode === 'disabledNoStyling'
                    ) {
                        this.el.nativeElement.disabled = true;
                        this.el.nativeElement.style['pointer-events'] = 'none';
                        this.el.nativeElement.classList.add('p-disabled');
                        this.el.nativeElement.style['opacity'] = 'unset';
                    } else if (conf.permissionConfig.mode === 'childDisabled') {
                        this.el.nativeElement.classList.add('p-disabled');
                    } else if (conf.permissionConfig.mode === 'hidden') {
                        this.el.nativeElement.style.visibility = 'hidden';
                    } else {
                        this.el.nativeElement.style.display = 'none';
                    }
                }
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();
    }
}
