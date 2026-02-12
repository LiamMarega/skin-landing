/// <reference types="astro/client" />

interface Window {
    openLeadModal: (planType: string) => void;
    __firebaseAnalytics?: {
        analytics: import("firebase/analytics").Analytics;
        logEvent: (name: string, params?: Record<string, string | number | boolean | undefined>) => void;
        logError: (details: { message: string; source?: string; lineno?: number; colno?: number; stack?: string; name?: string; reason?: string }) => void;
    };
}
