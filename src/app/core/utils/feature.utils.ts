import { FormattedFeatureControls } from '../models';

export function checkPageAccess(
    featureControls: FormattedFeatureControls | undefined,
    feature: string,
    page?: string | string[]
): boolean {
    if (!featureControls) {
        return false;
    }
    let pageAllowed = false;
    if (page && Array.isArray(page)) {
        if (featureControls[feature]?.pages) {
            const activePages = Object.keys(featureControls[feature].pages)
                .reduce<boolean[]>((acc, k) => {
                    if (page.indexOf(k) >= 0) {
                        acc.push(featureControls[feature].pages[k].isActive);
                    }
                    return acc;
                }, [])
                .filter((pageIsActive) => pageIsActive === true).length;
            pageAllowed = activePages > 0;
        } else {
            return false;
        }
    } else if (page) {
        pageAllowed =
            featureControls[feature]?.pages?.[page]?.isActive === true;
    } else {
        pageAllowed = true;
    }

    return featureControls[feature]?.isActive === true && pageAllowed;
}

export function checkPageFeatureAccess(
    featureControls: FormattedFeatureControls | undefined,
    feature: string,
    page: string,
    pageFeature: string
): boolean {
    if (!featureControls) {
        return false;
    }
    return (
        featureControls[feature]?.isActive === true &&
        (!page ||
            (featureControls[feature].pages?.[page]?.isActive === true &&
                featureControls[feature].pages[page].pageFeatures?.[pageFeature]
                    ?.isActive === true))
    );
}
