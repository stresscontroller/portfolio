import { Capacitor } from '@capacitor/core';

export function isWeb(): boolean {
    return Capacitor.getPlatform() === 'web';
}

export function isMobile(): boolean {
    return (
        Capacitor.getPlatform() === 'android' ||
        Capacitor.getPlatform() === 'ios'
    );
}

export function isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
}

export function isTouchDevice(): boolean {
    try {
        return window.matchMedia('(pointer: coarse)').matches;
    } catch (e) {
        return false;
    }
}

export function getViewportWidth(): number {
    try {
        return Math.max(
            document.documentElement.clientWidth || 0,
            window.innerWidth || 0
        );
    } catch (e) {
        return 0;
    }
}

export function viewportIsUnder(maxWidth: number): boolean {
    return getViewportWidth() < maxWidth;
}

export function viewportIsUnderMobileWidth(): boolean {
    return viewportIsUnder(640);
}

export function viewportIsUnderTabletWidth(): boolean {
    return viewportIsUnder(768);
}
