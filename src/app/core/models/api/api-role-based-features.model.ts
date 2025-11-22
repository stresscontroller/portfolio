import { Feature } from './api-feature-flag.model';

export interface AuthRole {
    id: string;
    name: string;
    isActive: boolean;
}

// RoleLinking
export interface Role {
    id: string;
    name: string; // "Developer",
    isActive: boolean;
    isGlobal: boolean;
    isEditatable: boolean | null;
    roleIndex: number;
    companyUniqueId: string;
}

export interface RoleLinkingFeature {
    id?: string;
    isActive: boolean;
    aspNetRoleId?: string;
    cruiseCodeGlobalFeatureId?: string;
    featureName?: string;
    linkingPages: RoleLinkingPage[];
    companyUniqueId?: string;
}

export interface RoleLinkingPage {
    id?: string;
    isActive: boolean;
    aspNetRoleId?: string;
    cruiseCodeGlobalPageId?: string;
    cruiseCodeGlobalParentFeatureId?: string;
    pageName?: string;
    linkingPageFeatures: RoleLinkingPageFeature[];
    companyUniqueId?: string;
}
export interface RoleLinkingPageFeature {
    id?: string;
    isActive: boolean;
    aspNetRoleId?: string;
    cruiseCodeGlobalPageFeatureId?: string;
    cruiseCodeGlobalParentPageId?: string;
    pageFeatureName?: string;
    companyUniqueId?: string;
}

export interface RoleLinkingFeatureInsert {
    id?: string;
    isActive: boolean;
    aspNetRoleId: string;
    cruiseCodeGlobalFeatureId: string;
    companyUniqueId: string;
}

export interface RoleLinkingPageInsert {
    id?: string;
    isActive: boolean;
    aspNetRoleId: string;
    cruiseCodeGlobalPageId: string;
    companyUniqueId: string;
}

export interface RoleLinkingPageFeatureInsert {
    id?: string;
    isActive: boolean;
    aspNetRoleId: string;
    cruiseCodeGlobalPageFeatureId: string;
    companyUniqueId: string;
}

export type RoleBasedFormattedFeatureControls = Record<
    string,
    {
        isActive: boolean;
        id: string;
        disabledGlobally: boolean;
        pages: RoleBasedFormattedFeatureControlsPage;
    }
>;
export type RoleBasedFormattedFeatureControlsPage = Record<
    string,
    {
        isActive: boolean;
        id: string;
        disabledGlobally: boolean;
        pageFeatures: RoleBasedFormattedFeatureControlsPageFeatures;
    }
>;

export type RoleBasedFormattedFeatureControlsPageFeatures = Record<
    string,
    {
        isActive: boolean;
        disabledGlobally: boolean;
        id: string;
    }
>;
export function formatRoleBasedFeatureControls(
    features: Feature[],
    roleBasedFeatures: Feature[]
): RoleBasedFormattedFeatureControls {
    const globalFeatureFlag =
        features.reduce<RoleBasedFormattedFeatureControls>((acc, curr) => {
            if (curr.name.toLowerCase().startsWith('operator')) {
                acc[curr.name] = {
                    isActive: curr.isActive,
                    id: curr.id!,
                    disabledGlobally: !curr.isActive,
                    pages: curr.pages.reduce<RoleBasedFormattedFeatureControlsPage>(
                        (pageAcc, pageCurr) => {
                            pageAcc[pageCurr.name] = {
                                isActive: pageCurr.isActive,
                                id: pageCurr.id!,
                                disabledGlobally: !pageCurr.isActive,
                                pageFeatures:
                                    pageCurr.pageFeatures.reduce<RoleBasedFormattedFeatureControlsPageFeatures>(
                                        (pageFeatureAcc, pageFeatureCurr) => {
                                            pageFeatureAcc[
                                                pageFeatureCurr.name
                                            ] = {
                                                isActive:
                                                    pageFeatureCurr.isActive,
                                                id: pageFeatureCurr.id!,
                                                disabledGlobally:
                                                    !pageFeatureCurr.isActive,
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
            }
            return acc;
        }, {});

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
