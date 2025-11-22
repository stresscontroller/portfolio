import { Feature } from './api-feature-flag.model';

export interface RoleBasedFeature {
    id: null;
    isActive: boolean;
    aspNetRoleId: null;
    cruiseCodeGlobalFeatureId: string;
    featureName: string;
    linkingPages: RoleBasedPage[];
}

export interface RoleBasedPage {
    id: null;
    isActive: boolean;
    aspNetRoleId: null;
    cruiseCodeGlobalPageId: string;
    cruiseCodeGlobalParentFeatureId: string;
    pageName: string;
    linkingPageFeatures: RoleBasedPageFeature[];
}

export interface RoleBasedPageFeature {
    id: null;
    isActive: boolean;
    aspNetRoleId: null;
    cruiseCodeGlobalPageFeatureId: string;
    cruiseCodeGlobalParentPageId: string;
    pageFeatureName: string;
    companyUniqueId: null;
}

export function toFeature(roleBasedFeature: RoleBasedFeature[]): Feature[] {
    return roleBasedFeature.map((feature) => {
        return {
            id: feature.id,
            isActive: feature.isActive,
            name: feature.featureName,
            pages: feature.linkingPages
                ? feature.linkingPages.map((page) => {
                      return {
                          id: page.id,
                          isActive: page.isActive,
                          name: page.pageName,
                          parentFeatureId: page.cruiseCodeGlobalParentFeatureId,
                          pageFeatures: page.linkingPageFeatures
                              ? page.linkingPageFeatures.map((pageFeature) => {
                                    return {
                                        id: pageFeature.id,
                                        isActive: pageFeature.isActive,
                                        name: pageFeature.pageFeatureName,
                                        parentPageId:
                                            pageFeature.cruiseCodeGlobalParentPageId,
                                    };
                                })
                              : [],
                      };
                  })
                : [],
        };
    });
}
