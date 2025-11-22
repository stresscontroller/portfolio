import { Features } from '../../constants';

export interface Feature {
    id: string | null;
    isActive: boolean;
    name: string;
    pages: Page[];
}
export interface Page {
    id: string | null;
    isActive: boolean;
    name: string;
    parentFeatureId: string;
    pageFeatures: PageFeatures[];
}
export interface PageFeatures {
    id: string | null;
    isActive: boolean;
    name: string;
    parentPageId: string;
}

export interface FeatureInsert {
    id?: string;
    isActive: boolean;
    name: string;
}

export interface PageInsert {
    isActive: boolean;
    name: string;
    parentFeatureId: string;
}

export interface PageFeatureInsert {
    isActive: boolean;
    name: string;
    parentPageId: string;
}

export type FormattedFeatureControls = Record<
    string,
    {
        isActive: boolean;
        pages: FormattedFeatureControlsPage;
        route?: string;
    }
>;
export type FormattedFeatureControlsPage = Record<
    string,
    {
        isActive: boolean;
        pageFeatures: FormattedFeatureControlsPageFeatures;
        route: string;
    }
>;

export type FormattedFeatureControlsPageFeatures = Record<
    string,
    {
        isActive: boolean;
    }
>;

export function formatFeatureControls(
    features: Feature[],
    roleBasedFeatures: Feature[]
): FormattedFeatureControls {
    const globalFeatureFlag = features.reduce<FormattedFeatureControls>(
        (acc, curr) => {
            const currentFeature = Object.values(Features).find(
                (f) => f.name === curr.name
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any;
            acc[curr.name] = {
                isActive: curr.isActive,
                route: currentFeature?.route,
                pages: curr.pages.reduce<FormattedFeatureControlsPage>(
                    (pageAcc, pageCurr) => {
                        const currentPage = currentFeature?.pages
                            ? (Object.values(currentFeature.pages).find(
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  (p: any) => p.name === pageCurr.name
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              ) as any)
                            : undefined;
                        pageAcc[pageCurr.name] = {
                            isActive: pageCurr.isActive,
                            route: currentPage?.route ?? '/',
                            pageFeatures:
                                pageCurr.pageFeatures.reduce<FormattedFeatureControlsPageFeatures>(
                                    (pageFeatureAcc, pageFeatureCurr) => {
                                        pageFeatureAcc[pageFeatureCurr.name] = {
                                            isActive: pageFeatureCurr.isActive,
                                        };
                                        return pageFeatureAcc;
                                    },
                                    {}
                                ),
                        };
                        return pageAcc;
                    },
                    {}
                ),
            };
            return acc;
        },
        {}
    );

    roleBasedFeatures.forEach((feature) => {
        if (feature.name in globalFeatureFlag) {
            // both has to be true for the feature to be active
            globalFeatureFlag[feature.name].isActive =
                globalFeatureFlag[feature.name].isActive && feature.isActive;
            feature.pages.forEach((page) => {
                globalFeatureFlag[feature.name].pages[page.name].isActive =
                    globalFeatureFlag[feature.name].pages[page.name].isActive &&
                    page.isActive;
                page.pageFeatures.forEach((pageFeature) => {
                    globalFeatureFlag[feature.name].pages[
                        page.name
                    ].pageFeatures[pageFeature.name].isActive =
                        globalFeatureFlag[feature.name].pages[page.name]
                            .pageFeatures[pageFeature.name].isActive &&
                        pageFeature.isActive;
                });
            });
        }
    });
    return globalFeatureFlag;
}
